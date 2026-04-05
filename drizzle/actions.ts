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

import {boolean, customType, timestamp, integer, json, pgTable, serial} from "drizzle-orm/pg-core";
import {z} from "zod";

const actionsVariants = [
    "register_user", "login_user", "delete_user", "ban_event", "level_event", "list_event", "panel_event",
    "level_like", "account_comment_like", "comment_like", "list_like", "unknown"
]

const s = z.enum(actionsVariants)

export type ActionVariant = z.infer<typeof s>

const actionType = customType<{
    data:  ActionVariant
}>({
    dataType: () => "integer",
    fromDriver: (value) => {
        if (typeof value !== "number") return "unknown"
        return actionsVariants[value] as ActionVariant
    },
    toDriver: (value) => {
        return actionsVariants.indexOf(value)
    }
})

type ActionAuth = {
    uname: string,
    email?: string
}

type ActionBan = {
    type: string,
    uname: string,
}

type ActionLevelBase = {
    name: string,
    type: string
}

type ActionMisc = {
    type: string
}

type ActionLevelUpload = {
    version: string,
    objects: string,
    starsReq: string,
} & ActionLevelBase

type ActionLevelDelete = {
    uname: string
} & ActionLevelBase

export type ActionData = {
    action: string
} & Partial<ActionAuth & ActionBan & ActionMisc & ActionLevelUpload & ActionLevelDelete>

export const actionsTable = pgTable("actions", {
    id: serial("id").primaryKey(),
    date: timestamp("date").notNull().defaultNow(),
    uid: integer("uid").notNull(),
    actionType: actionType("type").notNull(),
    targetId: integer("target_id").notNull(),
    isMod: boolean("isMod").notNull().default(false),
    data: json("data").notNull().$type<ActionData>().default({} as ActionData),
})