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
import {commaSeparated} from "./custom_types";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";

export const listsTable = pgTable("lists", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().default("Unnamed"),
    description: text("description").notNull().default(""),
    ownerId: integer("uid").notNull().default(0),
    version: integer("version").notNull().default(1),
    difficulty: integer("difficulty").notNull().default(-1),
    downloads: integer("downloads").notNull().default(0),
    likes: integer("likes").notNull().default(0),
    isFeatured: boolean("isFeatured").notNull().default(false),
    isUnlisted: boolean("isUnlisted").notNull().default(false),
    levels: commaSeparated("levels"),
    diamonds: integer("diamonds").notNull().default(0),
    levelDiamonds: integer("lvlDiamonds").notNull().default(0),
    uploadDate: timestamp("uploadDate").notNull().defaultNow(),
    updateDate: timestamp("updateDate").notNull().defaultNow()
})

export const listRelations = relations(listsTable, ({one}) => ({
    author: one(usersTable, {
        fields: [listsTable.ownerId],
        references: [usersTable.uid]
    })
}))
