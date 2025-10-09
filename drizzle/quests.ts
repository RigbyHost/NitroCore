import { pgTable, serial, text, integer, timestamp, customType } from "drizzle-orm/pg-core";

const questType = customType<{
    data: "event" | "daily" | "weekly" | "orbs" | "coins" | "stars"
}>({
    dataType: () => "int",
    toDriver: (value) => {
        return {
            event: -1,
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
    name: text("name").notNull(),
    needed: integer("needed").notNull(),
    reward: integer("reward").notNull(),
    levelId: integer("lvl_id").notNull(),
    timeAdded: timestamp("time_added").notNull(),
});