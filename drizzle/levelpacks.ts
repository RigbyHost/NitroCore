import {boolean, integer, pgTable, serial, text} from "drizzle-orm/pg-core";
import {citext, commaSeparated} from "./custom_types";

export const levelpacksTable = pgTable("levelpacks", {
    // Primary
    id: serial("id").primaryKey(),
    isGauntlet: boolean("packType").notNull(),
    packName: citext("packName").notNull(),
    levels: commaSeparated("levels").notNull(),

    // Settings
    packStars: integer("packStars").notNull().default(0),
    packCoins: integer("packCoins").notNull().default(0),
    packDifficulty: integer("packDifficulty").notNull(),
    packColor: text("packColor").notNull()
})