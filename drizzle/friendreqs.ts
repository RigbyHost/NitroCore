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

import {boolean, integer, pgTable, serial, text, timestamp} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";

export const friendRequestsTable = pgTable("friendreqs", {
    id: serial("id").primaryKey(),
    uidSrc: integer("uid_src").notNull(),
    uidDest: integer("uid_dest").notNull(),
    uploadDate: timestamp("uploadDate").notNull().defaultNow(),
    comment: text("comment").notNull().default(""),
    isNew: boolean("isNew").notNull().default(true),
})

export const friendRequestRelations = relations(friendRequestsTable, ({one}) => ({
    sender: one(usersTable, {
        fields: [friendRequestsTable.uidSrc],
        references: [usersTable.uid]
    }),
    receiver: one(usersTable, {
        fields: [friendRequestsTable.uidDest],
        references: [usersTable.uid]
    })
}))