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