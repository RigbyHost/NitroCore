import {boolean, datetime, int, mysqlTable, text} from "drizzle-orm/mysql-core";
import {relations, sql} from "drizzle-orm";
import {usersTable} from "./users";
import {levelsTable} from "~~/drizzle/levels";


export const commentsTable = mysqlTable("comments", {
    id: int("id").autoincrement().primaryKey(),
    uid: int("uid").notNull(),
    levelId: int("lvl_id").notNull(),
    comment: text("comment").notNull(),
    postedTime: datetime("postedTime").notNull().default(sql`CURRENT_TIMESTAMP`),
    likes: int("likes").notNull().default(0),
    isSpam: boolean("isSpam").notNull().default(false),
    percent: int("percent").notNull().default(0),
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