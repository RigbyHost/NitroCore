import {boolean, int, mysqlTable, text} from "drizzle-orm/mysql-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";
import {levelsTable} from "./levels";


export const rateQueueTable = mysqlTable("rateQueue", {
    id: int("id").autoincrement().primaryKey(),
    levelId: int("lvl_id").notNull(),
    name: text("name").notNull().default("Unnamed"),
    uid: int("uid").notNull(),
    modUid: int("mod_uid").notNull(),
    stars: int("stars").notNull().default(0),
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