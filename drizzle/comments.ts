import {boolean, integer, pgTable, serial, text, timestamp} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";
import {levelsTable} from "./levels";

export const commentsTable = pgTable("comments", {
    id: serial("id").primaryKey(),
    uid: integer("uid").notNull(),
    levelId: integer("lvl_id").notNull(),
    comment: text("comment").notNull(),
    postedTime: timestamp("postedTime").notNull().defaultNow(),
    likes: integer("likes").notNull().default(0),
    isSpam: boolean("isSpam").notNull().default(false),
    percent: integer("percent").notNull().default(0),
})

export const commentRelations = relations(commentsTable, ({one}) => ({
    author: one(usersTable, {
        fields: [commentsTable.uid],
        references: [usersTable.uid]
    }),
    level: one(levelsTable, {
        fields: [commentsTable.levelId],
        references: [levelsTable.id]
    })
}))