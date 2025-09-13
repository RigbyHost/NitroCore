import {integer, pgTable, serial, timestamp} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";
import {levelsTable} from "./levels";

export const scoresTable = pgTable("scores", {
    id: serial("id").primaryKey(),
    uid: integer("uid").notNull(),
    levelId: integer("lvl_id").notNull(),
    postedTime: timestamp("postedTime").notNull().defaultNow(),
    percent: integer("percent").notNull().default(0),
    attempts: integer("attempts").notNull().default(0),
    coins: integer("coins").notNull().default(0),
})

export const scoreRelations = relations(scoresTable, ({one}) => ({
    user: one(usersTable, {
        fields: [scoresTable.uid],
        references: [usersTable.uid]
    }),
    level: one(levelsTable, {
        fields: [scoresTable.levelId],
        references: [levelsTable.id]
    })
}))