import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const questsTable = pgTable("quests", {
    id: serial("id").primaryKey(),
    // Due to fucking robtop, we cannot have static types
    type: integer("type").notNull(),
    name: text("name").notNull(),
    needed: integer("needed").notNull(),
    reward: integer("reward").notNull(),
    levelId: integer("lvl_id").notNull(),
    timeAdded: timestamp("time_added").notNull(),
});