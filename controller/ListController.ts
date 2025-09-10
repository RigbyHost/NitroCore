import {List} from "~~/controller/List";
import {MakeOptional} from "~/utils/types";
import {levelsTable, listsTable, usersTable} from "~~/drizzle";


export class ListController {
    private readonly db: Database

    constructor(db: Database) {
        this.db = db
    }

    get $db() {
        return this.db
    }

    getOneList = async (id: number): Promise<Nullable<List<GetOneListReturnType>>> => {
        const data = await this.db.query.listsTable.findFirst({
            where: (list, {eq}) => eq(list.id, id),
            with: {
                author: {
                    columns: {username: true}
                }
            }
        })
        if (!data)
            return null
        return new List<GetOneListReturnType>(this, data)
    }

    getManyLists = async (ids: number[]) => {
        const lists = await this.db.query.listsTable.findMany({
            where: (list, {inArray}) => inArray(list.id, ids),
            with: {
                author: {
                    columns: {username: true}
                }
            }
        })
        return lists.map(list => new List<GetOneListReturnType>(this, list))
    }

    createListObject = (list: typeof listsTable.$inferSelect) => {
        return new List(this, list)
    }
}

type GetOneListReturnType =  typeof listsTable.$inferSelect
    & {author: Pick<typeof usersTable.$inferSelect, "username">}