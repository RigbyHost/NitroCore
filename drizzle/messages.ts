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

import {boolean, integer, pgTable, serial, text, timestamp} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";

export const messagesTable = pgTable("messages", {
    id: serial("id").primaryKey(),
    uidSrc: integer("uid_src").notNull(),
    uidDest: integer("uid_dest").notNull(),
    subject: text("subject").notNull().default(""),
    message: text("message").notNull(),
    postedTime: timestamp("postedTime").notNull().defaultNow(),
    isNew: boolean("isNew").notNull().default(true),
})

export const messageRelations = relations(messagesTable, ({one}) => ({
    sender: one(usersTable, {
        fields: [messagesTable.uidSrc],
        references: [usersTable.uid]
    }),
    receiver: one(usersTable, {
        fields: [messagesTable.uidDest],
        references: [usersTable.uid]
    })
}))