import {boolean, int, mysqlTable, text} from "drizzle-orm/mysql-core";
import {commaSeparated} from "./custom_types";


export const levelpacksTable = mysqlTable("levelpacks", {
    // Primary
    id: int("id").autoincrement().primaryKey(),
    isGauntlet: boolean("packType").notNull(),
    packName: text("packName").notNull(),
    levels: commaSeparated("levels").notNull(),

    // Settings
    packStars: int("packStars").notNull().default(0),
    packCoins: int("packCoins").notNull().default(0),
    packDifficulty: int("packDifficulty").notNull(),
    packColor: text("packColor").notNull()
})