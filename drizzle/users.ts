import {mysqlTable, int, text, datetime, json, boolean} from "drizzle-orm/mysql-core";
import {sql} from "drizzle-orm";
import {commaSeparated} from "./custom_types";

export const usersTable = mysqlTable("users", {
    // Primary
    uid: int("uid").autoincrement().primaryKey(),
    username: text("uname").notNull(),
    passwordHash: text("passhash").notNull(),
    gjpHash: text("gjphash").notNull(),
    email: text("email").notNull(),
    roleId: int("role_id").notNull().default(0),

    // Stats
    stars: int("stars").notNull().default(0),
    diamonds: int("diamonds").notNull().default(0),
    coins: int("coins").notNull().default(0),
    userCoins: int("ucoins").notNull().default(0),
    demons: int("demons").notNull().default(0),
    creatorPoints: int("cpoints").notNull().default(0),
    orbs: int("orbs").notNull().default(0),
    moons: int("moons").notNull().default(0),

    // Technical
    registerDate: datetime("regDate").notNull().default(sql`CURRENT_TIMESTAMP`),
    accessDate: datetime("accessDate").notNull().default(sql`CURRENT_TIMESTAMP`),
    lastIP: text("lastIP").notNull().default("Unknown"),
    gameVersion: int("gameVer").notNull().default(20),
    levelsCompleted: int("lvlsCompleted").notNull().default(0),
    special: int("special").notNull().default(0),
    protectMeta: json("protect_meta").notNull()
        .$type<{
            comment_time: number,
            post_time: number,
            message_time: number
        }>()
        .default({
            comment_time: 0,
            post_time: 0,
            message_time: 0
        }),
    protectLevelsToday: int("protect_levelsToday").notNull().default(0),
    protectTodayStars: int("protect_todayStars").notNull().default(0),


    // Relationships
    isBanned: boolean("isBanned").notNull().default(false),
    blacklistedUsers: commaSeparated("blacklist").notNull().default([]),
    friendsCount: int("friends_cnt").notNull().default(0),
    friendshipIds: commaSeparated("friendship_ids").notNull().default([]),

    // Settings
    iconType: int("iconType").notNull().default(0),
    vessels: json("vessels").notNull()
        .$type<{
            clr_primary: number, clr_secondary: number,
            cube: number, ship: number, ball: number, ufo: number, wave: number, robot: number,
            spider: number, swing: number, jetpack: number, trace: number, death: number
        }>()
        .default({
            clr_primary: 0, clr_secondary: 0,
            cube: 0, ship: 0, ball: 0, ufo: 0, wave: 0, robot: 0,
            spider: 0, swing: 0, jetpack: 0, trace: 0, death: 0
        }),
    chests: json("chests").notNull()
        .$type<{
            small_count: number,
            big_count: number,
            small_time: number,
            big_time: number
        }>()
        .default({
            small_count: 0,
            big_count: 0,
            small_time: 0,
            big_time: 0
        }),
    settings: json("settings").notNull()
        .$type<{
            frS: number,
            cS: number,
            mS: number,
            youtube: string,
            twitch: string,
            twitter: string,
        }>()
        .default({
            frS: 0,
            cS: 0,
            mS: 0,
            youtube: "",
            twitch: "",
            twitter: ""
        })
})

