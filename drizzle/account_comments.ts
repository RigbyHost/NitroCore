import {boolean, datetime, int, mysqlTable, text} from "drizzle-orm/mysql-core";
import {relations, sql} from "drizzle-orm";
import {usersTable} from "./users";


export const accountCommentsTable = mysqlTable("acccomments", {
    id: int("id").autoincrement().primaryKey(),
    uid: int("uid").notNull(),
    comment: text("comment").notNull(),
    postedTime: datetime("postedTime").notNull().default(sql`CURRENT_TIMESTAMP`),
    likes: int("likes").notNull().default(0),
    isSpam: boolean("isSpam").notNull().default(false),
})

export const accountCommentRelations = relations(accountCommentsTable, ({one}) => ({
    user: one(usersTable, {
        fields: [accountCommentsTable.uid],
        references: [usersTable.uid]
    })
}))
