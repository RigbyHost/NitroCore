import {boolean, datetime, int, mysqlTable, text} from "drizzle-orm/mysql-core";
import {commaSeparated} from "./custom_types";
import {sql} from "drizzle-orm";


export const listsTable = mysqlTable("lists", {
    id: int("id").autoincrement().primaryKey(),
    name: text("name").notNull().default("Unnamed"),
    description: text("description").notNull().default(""),
    uid: int("uid").notNull().default(0),
    version: int("version").notNull().default(1),
    difficulty: int("difficulty").notNull().default(-1),
    downloads: int("downloads").notNull().default(0),
    likes: int("likes").notNull().default(0),
    isFeatured: boolean("isFeatured").notNull().default(false),
    isUnlisted: boolean("isUnlisted").notNull().default(false),
    levels: commaSeparated("levels"),
    diamonds: int("diamonds").notNull().default(0),
    levelDiamonds: int("lvlDiamonds").notNull().default(0),
    uploadDate: datetime("uploadDate").notNull().default(sql`CURRENT_TIMESTAMP`),
    updateDate: datetime("updateDate").notNull().default(sql`CURRENT_TIMESTAMP`),
})