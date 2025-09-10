import {Database} from "~/utils/useDrizzle";
import {levelsTable, usersTable} from "~~/drizzle";
import {eq, getTableColumns} from "drizzle-orm";
import {MakeOptional} from "~/utils/types";
import {Level} from "~~/controller/Level";
import clamp from "clamp"
import {LevelFilter} from "~~/controller/LevelFilter";

export class LevelController {
    private readonly db: Database

    /**
     * @param db Drizzle database instance created via {@link useDrizzle} or {@link getDrizzleMiddleware}
     */
    constructor(db: Database) {
        this.db = db
    }

    get $db() {
        return this.db
    }

    getOneLevel = async (
        levelId: number,
        full = false,
    ): Promise<Nullable<Level<GetOneLevelReturnType>>> => {
        if (full) {
            const data = await this.db.query.levelsTable.findFirst({
                where: (level, {eq}) => eq(level.id, levelId),
                with: {
                    author: {
                        columns: {username: true}
                    }
                }
            })
            if (!data)
                return null
            return new Level<GetOneLevelReturnType>(this, data)
        } else {
            // I can't think of cleaner way to do this with query API
            const {stringLevel, ...columns} = getTableColumns(levelsTable)
            type Col = keyof typeof columns
            const colS = {} as Record<Col, true>
            Object.keys(columns).forEach(key => colS[key as Col] = true)
            const data = await this.db.query.levelsTable.findFirst({
                where: (level, {eq}) => eq(level.id, levelId),
                columns: colS,
                with: {
                    author: {
                        columns: {username: true}
                    }
                }
            })
            if (!data)
                return null
            return new Level<GetOneLevelReturnType>(this, data) || null
        }
    }

    getManyLevels = async (
        ids: number[],
        withUser = false,
    ) => {
        const levels = await this.db.query.levelsTable.findMany({
            where: (level, {inArray}) => inArray(level.id, ids),
            with: {
                author: withUser ? {
                    columns: {
                        uid: true,
                        username: true,
                    }
                } : undefined
            }
        })
        return levels.map(level => new Level(this, level))
    }

    createLevelObject = async (level: typeof levelsTable.$inferInsert) => {
        return new Level(this, level as typeof levelsTable.$inferSelect)
    }

    recalculateCreatorPoints = async (uid: number) => {
        const levels = await this.db.query.levelsTable.findMany({
            columns: {
                starsGot: true,
                isFeatured: true,
                epicness: true,
                collab: true,
            },
            where: (level, {eq}) => eq(level.ownerUid, uid)
        })
        let cpoints = 0
        levels.forEach(level => {
            if (level.starsGot)
                cpoints++
            if (level.isFeatured)
                cpoints++
            if (level.epicness)
                cpoints += clamp(level.epicness, 1, 3)
        })
        await this.db.update(usersTable).set({
            creatorPoints: cpoints
        }).where(eq(usersTable.uid, uid))
    }

    getFilter = () => new LevelFilter(this)
}

type GetOneLevelReturnType =  MakeOptional<typeof levelsTable.$inferSelect, "stringLevel">
    & {author: Pick<typeof usersTable.$inferSelect, "username">}