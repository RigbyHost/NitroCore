import {boolean, customType, timestamp, integer, json, pgTable, serial} from "drizzle-orm/pg-core";

const actionsVariants = [
    "register_user", "login_user", "delete_user", "ban_event", "level_event", "panel_event",
    "level_like", "account_comment_like", "comment_like", "list_like", "unknown"
]

export type ActionVariant = "register_user" | "login_user" | "delete_user" | "ban_event" | "level_event" | "panel_event" |
    "level_like" | "account_comment_like" | "comment_like" | "list_like" | "unknown"

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