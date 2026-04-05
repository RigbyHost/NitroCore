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

import { pgTable, serial, text, integer, timestamp, customType } from "drizzle-orm/pg-core";
import {sql} from "drizzle-orm";

export const mappingValues = {
    event: -1,
    daily: 0,
    weekly: 1,
    orbs: 2,
    coins: 3,
    stars: 4
}

const questType = customType<{
    data: "event" | "daily" | "weekly" | "orbs" | "coins" | "stars"
}>({
    dataType: () => "integer",
    toDriver: (value) => {
        return mappingValues[value]
    },
    fromDriver: (value) => {
        if (typeof value !== "number") return "daily"
        return {
            "-1": "event",
            "0": "daily",
            "1": "weekly",
            "2": "orbs",
            "3": "coins",
            "4": "stars"
        }[value.toString()] as "event" | "daily" | "weekly" | "orbs" | "coins" | "stars"
    }
})

export const questsTable = pgTable("quests", {
    id: serial("id").primaryKey(),
    // Due to fucking robtop, we cannot have static types
    type: questType("type").notNull(),
    name: text("name").notNull().default("Unnamed"),
    needed: integer("needed").notNull().default(0),
    reward: integer("reward").notNull().default(0),
    levelId: integer("lvl_id").notNull().default(0),
    timeAdded: timestamp("time_added").notNull().default(sql`CURRENT_TIMESTAMP`),
});