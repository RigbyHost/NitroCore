import {boolean, customType, datetime, int, json, mysqlTable} from "drizzle-orm/mysql-core";
import {sql} from "drizzle-orm";

const actionsVariants = [
    "register", "login", "delete_user", "ban_event", "level_event", "panel_event",
    "level_like", "account_comment_like", "comment_like", "list_like", "unknown"
]

const actionType = customType<{
    data:  typeof actionsVariants[number]
}>({
    dataType: () => "number",
    fromDriver: (value) => {
        if (typeof value !== "number") return "unknown"
        return actionsVariants[value] as typeof actionsVariants[number]
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
    type: string
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

type ActionData = {
    action: string
} & (ActionAuth | ActionBan | ActionMisc | ActionLevelUpload | ActionLevelDelete)

export const actionsTable = mysqlTable("actions", {
    id: int("id").autoincrement().primaryKey(),
    date: datetime("date").notNull().default(sql`CURRENT_TIMESTAMP`),
    uid: int("uid").notNull(),
    actionType: actionType("type").notNull(),
    targetId: int("target_id").notNull(),
    isMod: boolean("isMod").notNull().default(false),
    data: json("data").notNull().$type<ActionData>().default({} as ActionData),
})