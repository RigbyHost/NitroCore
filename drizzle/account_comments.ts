import {boolean, integer, pgTable, serial, text, timestamp} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";


export const accountCommentsTable = pgTable("acccomments", {
    id: serial("id").primaryKey(),
    uid: integer("uid").notNull(),
    comment: text("comment").notNull(),
    postedTime: timestamp("postedTime").notNull().defaultNow(),
    likes: integer("likes").notNull().default(0),
    isSpam: boolean("isSpam").notNull().default(false),
})

export const accountCommentRelations = relations(accountCommentsTable, ({one}) => ({
    user: one(usersTable, {
        fields: [accountCommentsTable.uid],
        references: [usersTable.uid]
    })
}))
