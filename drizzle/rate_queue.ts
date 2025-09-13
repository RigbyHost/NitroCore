import {boolean, integer, pgTable, serial, text} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";
import {levelsTable} from "./levels";

export const rateQueueTable = pgTable("rateQueue", {
    id: serial("id").primaryKey(),
    levelId: integer("lvl_id").notNull(),
    name: text("name").notNull().default("Unnamed"),
    uid: integer("uid").notNull(),
    modUid: integer("mod_uid").notNull(),
    stars: integer("stars").notNull().default(0),
    isFeatured: boolean("isFeatured").notNull().default(false),
})

export const rateQueueRelations = relations(rateQueueTable, ({one}) => ({
    level: one(levelsTable, {
        fields: [rateQueueTable.levelId],
        references: [levelsTable.id]
    }),
    user: one(usersTable, {
        fields: [rateQueueTable.uid],
        references: [usersTable.uid]
    }),
    moderator: one(usersTable, {
        fields: [rateQueueTable.modUid],
        references: [usersTable.uid]
    })
}))