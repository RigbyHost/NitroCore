/**
 * NitroCore - GDPS (Geometry Dash Private Server) implementation
 * Copyright (C) 2025 M41den <https://m41den.dev> and Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www?.gnu.org/licenses/>.
 */

import {List, type ListWithUser} from "~~/controller/List";
import {type MakeOptional} from "~/utils/types";
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
        const data = await this.db.query?.listsTable.findFirst({
            where: (list, {eq}) => eq(list?.id, id),
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
        const lists = await this.db.query?.listsTable.findMany({
            where: (list, {inArray}) => inArray(list?.id, ids),
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