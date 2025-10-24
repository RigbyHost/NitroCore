import {ListController} from "~~/controller/ListController";
import {requestSchema} from "~/routes/[srvid]/db/getGJLevelLists.php.post"
import {inArray, gt, SQL, gte, eq, desc, sql, ilike, and} from "drizzle-orm";
import {z} from "zod";
import {listsTable} from "~~/drizzle";
import {List, ListWithUser} from "~~/controller/List";

export class ListFilter {
    private controller: ListController
    private readonly db: Database

    constructor(controller: ListController) {
        this.controller = controller
        this.db = controller.$db
    }

    private filterParser = (data: z.infer<typeof requestSchema>) => {
        let filters: SQL[] = []
        let orderBy: SQL[] = []

        // The difficulty face for the list:
        // -1 = N/A, 0 = Auto, 1 = Easy, 2 = Normal, 3 = Hard, 4 = Harder, 5 = Insane,
        // 6 = Easy Demon, 7 = Medium Demon, 8 = Hard Demon, 9 = Insane Demon, 10 = Extreme Demon
        if (data.diff.length) {
            if (data.demonFilter !== undefined) {
                if (data.demonFilter === 0)
                    filters.push(gte(listsTable.difficulty, 6))
                else
                    filters.push(eq(listsTable.difficulty, 5+data.demonFilter))
            } else {
                filters.push(inArray(listsTable.difficulty, data.diff))
            }
        }

        if (data.star)
            filters.push(gt(listsTable.diamonds, 0))

        return {filters, orderBy}
    }

    searchLists = async (
        mode: SearchMode,
        data: z.infer<typeof requestSchema>
    ): Promise<{
        lists: Array<List<ListWithUser>>,
        total: number
    }> => {
        const {filters, orderBy} = this.filterParser(data)

        switch (mode) {
            case "mostliked":
                orderBy.push(desc(listsTable.likes), desc(listsTable.downloads))
                break
            case "mostdownloaded":
                orderBy.push(desc(listsTable.downloads), desc(listsTable.likes))
                break
            case "trending":
                filters.push(sql`${listsTable.uploadDate} > (DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY))`)
                orderBy.push(desc(listsTable.likes), desc(listsTable.downloads))
                break
            case "latest":
                orderBy.push(desc(listsTable.uploadDate), desc(listsTable.downloads))
                break
            case "awarded":
                filters.push(eq(listsTable.isFeatured, true), gt(listsTable.diamonds, 0))
                orderBy.push(desc(listsTable.uploadDate), desc(listsTable.downloads))
                break
            case "sent":
                filters.push(eq(listsTable.isFeatured, false), eq(listsTable.diamonds, 0))
                orderBy.push(desc(listsTable.uploadDate), desc(listsTable.downloads))
                break
            default:
                return {lists: [], total: 0}
        }

        if (data.str) {
            // Search logic
            const id = Number(data.str)
            if (!isNaN(id)) {
                filters.push(eq(listsTable.id, id))
            } else {
                filters.push(
                    eq(listsTable.isUnlisted, false),
                    ilike(listsTable.name, `%${data.str}%`)
                )
            }
        } else {
            // The return of Clowner the clown
            filters.push(eq(listsTable.isUnlisted, false))
        }

        const lists = await this.db.query.listsTable.findMany({
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
        const total = await this.db.$count(listsTable, and(...filters))

        return {
            lists: lists.map(list => new List<ListWithUser>(null as any, list)),
            total
        }
    }


    searchUserLists = async (
        data: z.infer<typeof requestSchema>,
        followMode: boolean,
    ): Promise<{
        lists: Array<List<ListWithUser>>,
        total: number
    }> => {
        const {filters, orderBy} = this.filterParser(data)

        if (data.str) {
            const id = Number(data.str)
            if (followMode && data.followed) {
                if (!isNaN(id)) {
                    filters.push(eq(listsTable.id, id))
                } else {
                    filters.push(
                        eq(listsTable.isUnlisted, false),
                        ilike(listsTable.name, `%${data.str}%`)
                    )
                }
                filters.push(inArray(listsTable.ownerId, data.followed))
            } else {
                if (!isNaN(id)) {
                    filters.push(eq(listsTable.ownerId, id))
                }
            }
        } else {
            if (followMode && data.followed) {
                filters.push(
                    eq(listsTable.isUnlisted, false),
                    inArray(listsTable.ownerId, data.followed)
                )
            }
        }

        const lists = await this.db.query.listsTable.findMany({
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
        const total = await this.db.$count(listsTable, and(...filters))

        return {
            lists: lists.map(list => new List<ListWithUser>(null as any, list)),
            total
        }
    }
}

type SearchMode = "mostliked" | "mostdownloaded" | "trending" | "latest" | "awarded" | "sent"