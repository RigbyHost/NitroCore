import {boolean, integer, numeric, pgTable, serial, text} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";

export const songsTable = pgTable("songs", {
    id: serial("id").primaryKey(),
    authorId: integer("author_id").notNull(),
    name: text("name").notNull().default("Unnamed"),
    artist: text("artist").notNull().default("Unknown"),
    size: numeric("size", { precision: 10, scale: 2, mode: "number" }).notNull(),
    url: text("url").notNull(),
    isBanned: boolean("isBanned").notNull().default(false),
    downloads: integer("downloads").notNull().default(0),
})

export const songRelations = relations(songsTable, ({one}) => ({
    author: one(usersTable, {
        fields: [songsTable.authorId],
        references: [usersTable.uid]
    })
}))