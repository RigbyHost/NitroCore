import {boolean, integer, pgTable, serial, text, timestamp} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";

export const messagesTable = pgTable("messages", {
    id: serial("id").primaryKey(),
    uidSrc: integer("uid_src").notNull(),
    uidDest: integer("uid_dest").notNull(),
    subject: text("subject").notNull().default(""),
    message: text("message").notNull(),
    postedTime: timestamp("postedTime").notNull().defaultNow(),
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