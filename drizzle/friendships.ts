import {boolean, integer, pgTable, serial} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";

export const friendshipsTable = pgTable("friendships", {
    id: serial("id").primaryKey(),
    uid1: integer("uid1").notNull(),
    uid2: integer("uid2").notNull(),
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