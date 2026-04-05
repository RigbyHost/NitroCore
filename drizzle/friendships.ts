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

import {boolean, integer, pgTable, serial} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";

export const friendshipsTable = pgTable("friendships", {
    id: serial("id").primaryKey(),
    uid1: integer("uid1").notNull(),
    uid2: integer("uid2").notNull(),
    u1_new: boolean("u1_new").notNull().default(false),
    u2_new: boolean("u2_new").notNull().default(false),
})

export const friendshipRelations = relations(friendshipsTable, ({one}) => ({
    user1: one(usersTable, {
        fields: [friendshipsTable.uid1],
        references: [usersTable.uid]
    }),
    user2: one(usersTable, {
        fields: [friendshipsTable.uid2],
        references: [usersTable.uid]
    })
}))