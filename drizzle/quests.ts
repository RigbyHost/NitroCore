import {customType, datetime, int, mysqlTable, text} from "drizzle-orm/mysql-core";

const questType = customType<{
    data: "daily" | "weekly" | "orbs" | "coins" | "stars"
}>({
    dataType: () => "int",
    toDriver: (value) => {
        return {
            daily: 0,
            weekly: 1,
            orbs: 2,
            coins: 3,
            stars: 4
        }[value]
    },
    fromDriver: (value) => {
        if (typeof value !== "number") return "daily"
        return {
            0: "daily",
            1: "weekly",
            2: "orbs",
            3: "coins",
            4: "stars"
        }[value] as "daily" | "weekly" | "orbs" | "coins" | "stars"
    }
})

export const questsTable = mysqlTable("quests", {
    id: int("id").autoincrement().primaryKey(),
    type: questType("type").notNull(),
    name: text("name").notNull(),
    needed: int("needed").notNull(),
    reward: int("reward").notNull(),
    levelId: int("lvl_id").notNull(),
    timeAdded: datetime("timeExpire").notNull(),
})