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

import {boolean, integer, numeric, pgTable, serial, text} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";

export const songsTable = pgTable("songs", {
    id: serial("id").primaryKey(),
    authorId: integer("author_id").notNull(),
    name: text("name").notNull().default("Unnamed"),
    artist: text("artist").notNull().default("Unknown"),
    size: numeric("size", { precision: 10, scale: 2, mode: "number" }).notNull(),
    url: text("url").notNull(),
    isBanned: boolean("isBanned").notNull().default(false),
    downloads: integer("downloads").notNull().default(0),
})

export const songRelations = relations(songsTable, ({one}) => ({
    author: one(usersTable, {
        fields: [songsTable.authorId],
        references: [usersTable.uid]
    })
}))