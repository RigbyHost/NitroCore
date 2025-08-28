import {datetime, int, mysqlTable} from "drizzle-orm/mysql-core";
import {relations, sql} from "drizzle-orm";
import {usersTable} from "./users";
import {levelsTable} from "./levels";


export const scoresTable = mysqlTable("scores", {
    id: int("id").autoincrement().primaryKey(),
    uid: int("uid").notNull(),
    levelId: int("lvl_id").notNull(),
    postedTime: datetime("postedTime").notNull().default(sql`CURRENT_TIMESTAMP`),
    percent: int("percent").notNull().default(0),
    attempts: int("attempts").notNull().default(0),
    coins: int("coins").notNull().default(0),
})

export const scoreRelations = relations(scoresTable, ({one}) => ({
    user: one(usersTable, {
        fields: [scoresTable.uid],
        references: [usersTable.uid]
    }),
    level: one(levelsTable, {
        fields: [scoresTable.levelId],
        references: [levelsTable.id]
    })
}))