import {boolean, int, mysqlTable, text} from "drizzle-orm/mysql-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";


export const friendRequestsTable = mysqlTable("friendreqs", {
    id: int("id").autoincrement().primaryKey(),
    uidSrc: int("uid_src").notNull(),
    uidDest: int("uid_dest").notNull(),
    uploadDate: int("uploadDate").notNull(),
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