import {boolean, doublePrecision, integer, json, pgTable, serial, text, timestamp} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {usersTable} from "./users";

// TODO: Drizzle migration CREATE TABLE levels (...) AUTO_INCREMENT=30;

export const levelsTable = pgTable("levels", {
    // Primary
    id: serial("id").primaryKey(),
    name: text("name").notNull().default("Unnamed"),
    description: text("description").notNull().default(""),
    ownerUid: integer("uid").notNull(),
    password: text("password").notNull().default(""),
    version: integer("version").notNull().default(1),

    // Diff
    length: integer("length").notNull().default(0),
    difficulty: integer("difficulty").notNull().default(0),
    demonDifficulty: integer("demonDifficulty").notNull().default(-1),
    suggestedDifficulty: doublePrecision("suggestDifficulty").notNull().default(0),
    suggestedDifficultyCount: integer("suggestDifficultyCount").notNull().default(0),

    // Meta
    trackId: integer("track_id").notNull().default(0),
    songId: integer("song_id").notNull().default(0),
    versionGame: integer("versionGame").notNull(),
    versionBinary: integer("versionBinary").notNull(),
    expandableStore: json("stringExtra").$type<{
        extra_string: string,
        ts: number,
    }>(),
    stringSettings: text("stringSettings").notNull().default(""),
    stringLevel: text("stringLevel").notNull(),
    stringLevelInfo: text("stringLevelInfo").notNull().default(""),
    originalId: integer("original_id").notNull().default(0),

    // Stats
    objects: integer("objects").notNull().default(0),
    starsRequested: integer("starsRequested").notNull().default(0),
    starsGot: integer("starsGot").notNull().default(0),
    userCoins: integer("ucoins").notNull().default(0),
    coins: integer("coins").notNull().default(0),
    downloads: integer("downloads").notNull().default(0),
    likes: integer("likes").notNull().default(0),
    reports: integer("reports").notNull().default(0),
    // /**
    //  * @deprecated The field is rudimentary and exists only for compatibility purposes
    //  */
    collab: text("collab").notNull().default(""),

    // Flags
    is2player: boolean("is2p").notNull().default(false),
    isVerified: boolean("isVerified").notNull().default(false),
    isFeatured: boolean("isFeatured").notNull().default(false),
    isHallOfFame: boolean("isHall").notNull().default(false),
    epicness: integer("isEpic").notNull().default(0),
    unlistedType: integer("isUnlisted").notNull().default(0),
    isLDM: boolean("isLDM").notNull().default(false),

    // Dates
    uploadDate: timestamp("uploadDate").notNull().defaultNow(),
    updateDate: timestamp("updateDate").notNull().defaultNow()
})

export const levelRelations = relations(levelsTable, ({one})=> ({
    author: one(usersTable, {
        fields: [levelsTable.ownerUid],
        references: [usersTable.uid]
    })
}))