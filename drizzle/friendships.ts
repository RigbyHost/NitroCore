import {boolean, int, mysqlTable} from "drizzle-orm/mysql-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";

export const friendshipsTable = mysqlTable("friendships", {
    id: int("id").autoincrement().primaryKey(),
    uid1: int("uid1").notNull(),
    uid2: int("uid2").notNull(),
    u1_new: boolean("u1_new").notNull().default(false),
    u2_new: boolean("u2_new").notNull().default(false),
})

export const friendshipRelations = relations(friendshipsTable, ({one}) => ({
    user1: one(usersTable, {
        fields: [friendshipsTable.uid1],
        references: [usersTable.uid]
    }),
    user2: one(usersTable, {
        fields: [friendshipsTable.uid2],
        references: [usersTable.uid]
    })
}))