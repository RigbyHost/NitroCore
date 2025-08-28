import {boolean, float, int, mysqlTable, text} from "drizzle-orm/mysql-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";


export const songsTable = mysqlTable("songs", {
    id: int("id").autoincrement().primaryKey(),
    authorId: int("author_id").notNull(),
    name: text("name").notNull().default("Unnamed"),
    artist: text("artist").notNull().default("Unknown"),
    size: float({precision: 2}).notNull(),
    url: text("url").notNull(),
    isBanned: boolean("isBanned").notNull().default(false),
    downloads: int("downloads").notNull().default(0),
})

export const songRelations = relations(songsTable, ({one}) => ({
    author: one(usersTable, {
        fields: [songsTable.authorId],
        references: [usersTable.uid]
    })
}))