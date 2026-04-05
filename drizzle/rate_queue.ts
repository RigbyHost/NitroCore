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
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {boolean, integer, pgTable, serial, text} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";
import {levelsTable} from "./levels";

export const rateQueueTable = pgTable("rateQueue", {
    id: serial("id").primaryKey(),
    levelId: integer("lvl_id").notNull(),
    name: text("name").notNull().default("Unnamed"),
    uid: integer("uid").notNull(),
    modUid: integer("mod_uid").notNull(),
    stars: integer("stars").notNull().default(0),
    isFeatured: boolean("isFeatured").notNull().default(false),
})

export const rateQueueRelations = relations(rateQueueTable, ({one}) => ({
    level: one(levelsTable, {
        fields: [rateQueueTable.levelId],
        references: [levelsTable.id]
    }),
    user: one(usersTable, {
        fields: [rateQueueTable.uid],
        references: [usersTable.uid]
    }),
    moderator: one(usersTable, {
        fields: [rateQueueTable.modUid],
        references: [usersTable.uid]
    })
}))