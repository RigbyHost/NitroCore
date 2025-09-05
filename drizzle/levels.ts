import {boolean, datetime, float, int, json, mysqlTable, text} from "drizzle-orm/mysql-core";
import {relations, sql} from "drizzle-orm";
import {usersTable} from "./users";

// TODO: Drizzle migration CREATE TABLE levels (...) AUTO_INCREMENT=30;

export const levelsTable = mysqlTable("levels", {
    // Primary
    id: int("id").autoincrement().primaryKey(),
    name: text("name").notNull().default("Unnamed"),
    description: text("description").notNull().default(""),
    ownerUid: int("uid").notNull(),
    password: text("password").notNull().default(""),
    version: int("version").notNull().default(1),

    // Diff
    length: int("length").notNull().default(0),
    difficulty: int("difficulty").notNull().default(0),
    demonDifficulty: int("demonDifficulty").notNull().default(-1),
    suggestedDifficulty: float("suggestDifficulty").notNull().default(0),
    suggestedDifficultyCount: int("suggestDifficultyCount").notNull().default(0),

    // Meta
    trackId: int("track_id").notNull().default(0),
    songId: int("song_id").notNull().default(0),
    versionGame: int("versionGame").notNull(),
    versionBinary: int("versionBinary").notNull(),
    expandableStore: json("stringExtra").$type<{
        extra_string: string,
        ts: number,
    }>(),
    stringSettings: text("stringSettings").notNull().default(""),
    stringLevel: text("stringLevel").notNull(),
    stringLevelInfo: text("stringLevelInfo").notNull().default(""),
    originalId: int("original_id").notNull().default(0),

    // Stats
    objects: int("objects").notNull().default(0),
    starsRequested: int("starsRequested").notNull().default(0),
    starsGot: int("starsGot").notNull().default(0),
    userCoins: int("ucoins").notNull().default(0),
    coins: int("coins").notNull().default(0),
    downloads: int("downloads").notNull().default(0),
    likes: int("likes").notNull().default(0),
    reports: int("reports").notNull().default(0),
    // /**
    //  * @deprecated The field is rudimentary and exists only for compatibility purposes
    //  */
    collab: text("collab").notNull().default(""),

    // Flags
    is2player: boolean("is2p").notNull().default(false),
    isVerified: boolean("isVerified").notNull().default(false),
    isFeatured: boolean("isFeatured").notNull().default(false),
    isHallOfFame: boolean("isHall").notNull().default(false),
    epicness: int("isEpic").notNull().default(0),
    unlistedType: int("isUnlisted").notNull().default(0),
    isLDM: boolean("isLDM").notNull().default(false),

    // Dates
    uploadDate: datetime("uploadDate").notNull().default(sql`CURRENT_TIMESTAMP`),
    updateDate: datetime("updateDate").notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const levelUserRelations = relations(levelsTable, ({one})=> ({
    author: one(usersTable, {
        fields: [levelsTable.ownerUid],
        references: [usersTable.uid]
    })
}))