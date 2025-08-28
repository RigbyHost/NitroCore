import {boolean, datetime, int, mysqlTable, text} from "drizzle-orm/mysql-core";
import {relations, sql} from "drizzle-orm";
import {usersTable} from "./users";


export const messagesTable = mysqlTable("messages", {
    id: int("id").autoincrement().primaryKey(),
    uidSrc: int("uid_src").notNull(),
    uidDest: int("uid_dest").notNull(),
    subject: text("subject").notNull().default(""),
    message: text("message").notNull(),
    postedTime: datetime("postedTime").notNull().default(sql`CURRENT_TIMESTAMP`),
    isNew: boolean("isNew").notNull().default(true),
})

export const messageRelations = relations(messagesTable, ({one}) => ({
    sender: one(usersTable, {
        fields: [messagesTable.uidSrc],
        references: [usersTable.uid]
    }),
    receiver: one(usersTable, {
        fields: [messagesTable.uidDest],
        references: [usersTable.uid]
    })
}))