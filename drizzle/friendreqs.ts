import {boolean, integer, pgTable, serial, text, timestamp} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";

export const friendRequestsTable = pgTable("friendreqs", {
    id: serial("id").primaryKey(),
    uidSrc: integer("uid_src").notNull(),
    uidDest: integer("uid_dest").notNull(),
    uploadDate: timestamp("uploadDate").notNull().defaultNow(),
    comment: text("comment").notNull().default(""),
    isNew: boolean("isNew").notNull().default(true),
})

export const friendRequestRelations = relations(friendRequestsTable, ({one}) => ({
    sender: one(usersTable, {
        fields: [friendRequestsTable.uidSrc],
        references: [usersTable.uid]
    }),
    receiver: one(usersTable, {
        fields: [friendRequestsTable.uidDest],
        references: [usersTable.uid]
    })
}))