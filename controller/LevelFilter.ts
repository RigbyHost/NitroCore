import {LevelController} from "~~/controller/LevelController";
import {
    eq,
    lte,
    gt,
    gte,
    inArray,
    notInArray,
    exists,
    and,
    or,
    SQL,
    desc,
    sql,
    ilike,
    getTableColumns
} from "drizzle-orm";
import {levelsTable, questsTable, rateQueueTable} from "~~/drizzle";
import {z} from "zod";
import {requestSchema} from "~/routes/[srvid]/db/getGJLevels.php.post";
import {Level, LevelWithUser} from "~~/controller/Level";


export class LevelFilter {
    private controller: LevelController
    private readonly db: Database

    constructor(controller: LevelController) {
        this.controller = controller
        this.db = controller.$db
    }

    private filterParser = (data: z.infer<typeof requestSchema>) => {
        let filters: SQL[] = [lte(levelsTable.versionGame, data.gameVersion)]
        let orderBy: SQL[] = []

        if (data.diff.length) {
            const diffs: number[] = []
            data.diff.forEach(diff => {
                switch (diff) {
                    case -2:
                        switch (data.demonFilter) {
                            case 1:
                                data.demonFilter = 3
                                return
                            case 2:
                                data.demonFilter = 4
                                return
                            case 3:
                                data.demonFilter = 0
                                break
                            case 4:
                                data.demonFilter = 5
                                break
                            case 5:
                                data.demonFilter = 6
                                break
                            default:
                                data.demonFilter = 0
                        }
                        break
                    case -1:
                        diffs.push(0)
                        break
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        diffs.push(Number(`${diff}0`))
                        break
                    default:
                        diffs.push(-1)
                }
            })

            if (data.demonFilter !== undefined) {
                if (data.demonFilter === 0)
                    filters.push(gte(levelsTable.demonDifficulty, 0))
                else
                    filters.push(eq(levelsTable.demonDifficulty, data.demonFilter))
            } else {
                filters.push(
                    eq(levelsTable.demonDifficulty, -1),
                    inArray(levelsTable.difficulty, diffs)
                )
            }
        }

        if (data.len.length)
            filters.push(inArray(levelsTable.length, data.len))

        if (data.onlyCompleted || data.uncompleted) {
            if (data.completedLevels) {
                const fn = data.uncompleted ? notInArray : inArray
                filters.push(fn(levelsTable.id, data.completedLevels))
            }
        }

        const rateFilters: SQL<unknown>[] = []
        if (data.featured)
            rateFilters.push(eq(levelsTable.isFeatured, true))
        if (data.epic)
            rateFilters.push(eq(levelsTable.epicness, 1))
        if (data.mythic)
            rateFilters.push(eq(levelsTable.epicness, 2))
        if (data.legendary)
            rateFilters.push(eq(levelsTable.epicness, 3))

        if (rateFilters.length > 0) {
            if (rateFilters.length === 1)
                filters.push(rateFilters[0])
            else
                filters.push(or(...rateFilters)!)
        }

        if (data.coins)
            filters.push(gt(levelsTable.coins, 0))

        if (data.star || data.noStar) {
            const fn = data.noStar ? eq : gt
            filters.push(fn(levelsTable.starsGot, 0))
        }

        // TODO: check if this works correctly
        if (data.song !== undefined) {
            if (data.songCustom) {
                // For custom songs, songId is 0 and trackId is (song + 1)
                filters.push(
                    eq(levelsTable.songId, 0),
                    eq(levelsTable.trackId, data.song + 1)
                )
            } else {
                // For official songs, use the song ID directly
                filters.push(eq(levelsTable.songId, data.song))
            }
        }

        return {filters, orderBy}
    }

    searchLevels = async (
        mode: SearchMode,
        data: z.infer<typeof requestSchema>,
    ): Promise<{
        levels: Level<LevelWithUser>[],
        total: number
    }> => {
        const {filters, orderBy} = this.filterParser(data)

        switch (mode) {
            case "mostliked":
                orderBy.push(desc(levelsTable.likes), desc(levelsTable.downloads))
                break
            case "mostdownloaded":
                orderBy.push(desc(levelsTable.downloads), desc(levelsTable.likes))
                break
            case "trending":
                filters.push(sql`${levelsTable.uploadDate} > (CURRENT_DATE - INTERVAL '7' DAY)`)
                orderBy.push(desc(levelsTable.likes), desc(levelsTable.downloads))
                break
            case "latest":
                orderBy.push(desc(levelsTable.uploadDate), desc(levelsTable.downloads))
                break
            case "magic":
                filters.push(
                    gte(levelsTable.objects, 10_000),
                    gte(levelsTable.length, 3),
                    eq(levelsTable.originalId, 0)
                )
                orderBy.push(desc(levelsTable.uploadDate), desc(levelsTable.downloads))
                break
            case "sent":
                filters.push(sql`
                    ${levelsTable.id} IN (
                        SELECT ${rateQueueTable.levelId}
                        FROM ${rateQueueTable}
                    )
                `)
                orderBy.push(desc(levelsTable.uploadDate), desc(levelsTable.downloads))
                break
            case "hall":
                filters.push(gte(levelsTable.epicness, 1))
                orderBy.push(desc(levelsTable.likes), desc(levelsTable.downloads))
                break
            // SAFE
            case "safe_daily":
                filters.push(exists(
                    this.db.select({id: questsTable.id}).from(questsTable).where(and(
                        eq(questsTable.levelId, levelsTable.id),
                        eq(questsTable.type, "daily")
                    ))
                ))
                orderBy.push(desc(levelsTable.uploadDate), desc(levelsTable.downloads))
                break
            case "safe_weekly":
                filters.push(exists(
                    this.db.select({id: questsTable.id}).from(questsTable).where(and(
                        eq(questsTable.levelId, levelsTable.id),
                        eq(questsTable.type, "weekly")
                    ))
                ))
                orderBy.push(desc(levelsTable.uploadDate), desc(levelsTable.downloads))
                break
            case "safe_event":
                filters.push(exists(
                    this.db.select({id: questsTable.id}).from(questsTable).where(and(
                        eq(questsTable.levelId, levelsTable.id),
                        eq(questsTable.type, "event")
                    ))
                ))
                orderBy.push(desc(levelsTable.uploadDate), desc(levelsTable.downloads))
                break
            default:
                return {levels: [], total: 0}
        }

        if (data.str) {
            // Search logic
            const id = Number(data.str)
            if (!isNaN(id)) {
                filters.push(eq(levelsTable.id, id))
            } else {
                filters.push(
                    eq(levelsTable.unlistedType, 0),
                    ilike(levelsTable.name, `%${data.str}%`)
                )
            }
        } else {
            // Just clowning around
            filters.push(eq(levelsTable.unlistedType, 0))
        }

        // Copied from LevelController. In theory should prevent sorting issues
        // I can't think of cleaner way to do this with query API
        // TODO: Compare column selector performance and consistency
        const {stringLevel, ...columns} = getTableColumns(levelsTable)
        type Col = keyof typeof columns
        const colS = {} as Record<Col, true>
        Object.keys(columns).forEach(key => colS[key as Col] = true)

        const levels = await this.db.query.levelsTable.findMany({
            columns: colS,
            with: {
                author: {
                    columns: {
                        uid: true,
                        username: true
                    }
                }
            },
            where: and(...filters),
            orderBy,
            limit: 10,
            offset: data.page * 10
        })
        const total = await this.db.$count(levelsTable, and(...filters))

        return {
            levels: levels.map(level => new Level<LevelWithUser>(this.controller, level)),
            total
        }
    }

    searchUserLevels = async (
        data: z.infer<typeof requestSchema>,
        followMode: boolean,
    ): Promise<{
        levels: Level<LevelWithUser>[],
        total: number
    }> => {
        const {filters, orderBy} = this.filterParser(data)

        if (data.str) {
            const id = Number(data.str)
            if (followMode && data.followed) {
                if (!isNaN(id)) {
                    filters.push(eq(levelsTable.id, id))
                } else {
                    filters.push(
                        eq(levelsTable.unlistedType, 0),
                        ilike(levelsTable.name, `%${data.str}%`)
                    )
                }
                filters.push(inArray(levelsTable.ownerUid, data.followed))
            } else {
                if (!isNaN(id)) {
                    filters.push(eq(levelsTable.ownerUid, id))
                }
            }
        } else {
            if (followMode && data.followed) {
                filters.push(
                    eq(levelsTable.unlistedType, 0),
                    inArray(levelsTable.ownerUid, data.followed)
                )
            }
        }

        // Copied from LevelController. In theory should prevent sorting issues
        // I can't think of cleaner way to do this with query API
        // TODO: Compare column selector performance and consistency
        const {stringLevel, ...columns} = getTableColumns(levelsTable)
        type Col = keyof typeof columns
        const colS = {} as Record<Col, true>
        Object.keys(columns).forEach(key => colS[key as Col] = true)

        const levels = await this.db.query.levelsTable.findMany({
            columns: colS,
            where: and(...filters),
            with: {
                author: {
                    columns: {
                        uid: true,
                        username: true
                    }
                }
            },
            orderBy,
            limit: 10,
            offset: data.page * 10
        })
        const total = await this.db.$count(levelsTable, and(...filters))

        return {
            levels: levels.map(level => new Level<LevelWithUser>(this.controller, level)),
            total
        }
    }

    searchListLevels = async (
        data: z.infer<typeof requestSchema>,
    ): Promise<{
        levels: Level<LevelWithUser>[],
        total: number
    }> => {
        const {filters, orderBy} = this.filterParser(data)

        if (data.str) {
            const strSchema = z.string().nonempty()
                .regex(/^(\d(?:,\d)*|-)$/) // x,y,z... or - (empty)
                .optional().transform(
                    value => value === "-" ? "" : value
                )

            if (strSchema.safeParse(data.str).success) {
                const ids = data.str.split(",").map(id => Number(id))
                filters.push(inArray(levelsTable.id, ids))

                // Copied from LevelController. In theory should prevent sorting issues
                // I can't think of cleaner way to do this with query API
                // TODO: Compare column selector performance and consistency
                const {stringLevel, ...columns} = getTableColumns(levelsTable)
                type Col = keyof typeof columns
                const colS = {} as Record<Col, true>
                Object.keys(columns).forEach(key => colS[key as Col] = true)

                const levels = await this.db.query.levelsTable.findMany({
                    columns: colS,
                    where: and(...filters),
                    with: {
                        author: {
                            columns: {
                                uid: true,
                                username: true
                            }
                        }
                    },
                    orderBy,
                    limit: 10,
                    offset: data.page * 10
                })
                const total = await this.db.$count(levelsTable, and(...filters))

                return {
                    levels: levels.map(level => new Level<LevelWithUser>(this.controller, level)),
                    total
                }
            }
        }

        return {levels: [], total: 0}
    }
}


type SearchMode = "mostliked" | "mostdownloaded" | "trending" | "latest" | "magic" | "hall" | "sent" |
    "safe_daily" | "safe_weekly" | "safe_event"
