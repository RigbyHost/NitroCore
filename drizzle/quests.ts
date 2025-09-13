import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const questTypeEnum = pgEnum("quest_type", ["event", "daily", "weekly", "orbs", "coins", "stars"]);

export const questsTable = pgTable("quests", {
    id: serial("id").primaryKey(),
    type: questTypeEnum("type").notNull(),
    name: text("name").notNull(),
    needed: integer("needed").notNull(),
    reward: integer("reward").notNull(),
    levelId: integer("lvl_id").notNull(),
    timeAdded: timestamp("time_added").notNull(),
});