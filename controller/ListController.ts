import {List, ListWithUser} from "~~/controller/List";
import {MakeOptional} from "~/utils/types";
import {levelsTable, listsTable, usersTable} from "~~/drizzle";
import {ListFilter} from "~~/controller/ListFilter";


export class ListController {
    private readonly db: Database

    constructor(db: Database) {
        this.db = db
    }

    get $db() {
        return this.db
    }

    getOneList = async (id: number): Promise<Nullable<List<ListWithUser>>> => {
        const data = await this.db.query.listsTable.findFirst({
            where: (list, {eq}) => eq(list.id, id),
            with: {
                author: {
                    columns: {
                        uid: true,
                        username: true
                    }
                }
            },
        })
        if (!data)
            return null
        return new List<ListWithUser>(this, data)
    }

    getManyLists = async (ids: number[]) => {
        const lists = await this.db.query.listsTable.findMany({
            where: (list, {inArray}) => inArray(list.id, ids),
            with: {
                author: {
                    columns: {
                        uid: true,
                        username: true
                    }
                }
            },
        })
        return lists.map(list => new List<ListWithUser>(this, list))
    }

    createListObject = (list: typeof listsTable.$inferInsert) => {
        return new List(this, list as typeof listsTable.$inferSelect)
    }

    getFilter = () => new ListFilter(this)
}