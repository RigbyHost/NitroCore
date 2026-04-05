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

import { sql } from "drizzle-orm"
import {questsTable} from "~~/drizzle";

export class QuestsController {
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

    getOneQuest = async (
        {type, numericType}: {
            type?: "daily" | "weekly" | "event",
            numericType?: number
        }
    ) => {
        if (type) {
            const data = await this.db.query?.questsTable.findFirst({
                where: (quest, {eq, lte, and}) => and(
                    eq(quest?.type, type),
                    lte(quest?.timeAdded, sql`CURRENT_TIMESTAMP`) // AVAILABLE
                ),
                // LAST AVAILABLE
                orderBy: (quest, {desc}) => [desc(quest?.timeAdded)]
            }).then(q => {
                if (q && type === "weekly")
                    q.id+=100001 // RobTop be damned
                return q
            })
            return data || null
        }
        if (numericType !== undefined) {
            switch (numericType) {
                case -1:
                    numericType = 0
                    break
                case -2:
                    numericType = 1
                    break
                case -3:
                    numericType = -1
                    break
            }
            const data = await this.db.query?.questsTable.findFirst({
                where: (quest) => {
                    return numericType === 2 ? sql`${quest?.type}>1` : sql`${quest?.type}=${numericType}`
                }
            })
            return data || null
        }

        return null
    }

    getQuests = async () => {
        const max_id = await this.db.$count(questsTable, sql`${questsTable?.type}>1`)
        return this.db.query?.questsTable.findMany({
            where: (quest, {lte, and}) => and(
                lte(quest?.timeAdded, sql`CURRENT_TIMESTAMP`),
                sql`${questsTable?.type}>1`,
            ),
            limit: 3,
            orderBy: (quest, {sql}) => sql`RANDOM()`
        });
    }
}