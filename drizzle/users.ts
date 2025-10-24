import {pgTable, integer, text, timestamp, jsonb, serial} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {commaSeparated} from "./custom_types";
import {rolesTable} from "./roles";
import {accountCommentsTable} from "./account_comments";
import {commentsTable} from "./comments";
import {levelsTable} from "./levels";

export const usersTable = pgTable("users", {
    // Primary
    uid: serial("uid").primaryKey(),
    username: text("uname").notNull(),
    passwordHash: text("passhash").notNull(),
    gjpHash: text("gjphash").notNull(),
    email: text("email").notNull(),
    roleId: integer("role_id").notNull().default(0),

    // Stats
    stars: integer("stars").notNull().default(0),
    diamonds: integer("diamonds").notNull().default(0),
    coins: integer("coins").notNull().default(0),
    userCoins: integer("ucoins").notNull().default(0),
    demons: integer("demons").notNull().default(0),
    creatorPoints: integer("cpoints").notNull().default(0),
    orbs: integer("orbs").notNull().default(0),
    moons: integer("moons").notNull().default(0),
    extraData: jsonb("extraData")
        .$type<{
        demon_stats: {
            standard: {
                easy: number,
                medium: number,
                hard: number,
                insane: number,
                extreme: number
            },
            platformer: {
                easy: number,
                medium: number,
                hard: number,
                insane: number,
                extreme: number
            },
            weekly: number,
            gauntlet: number
        },
            standard_stats: {
                auto: number,
                easy: number,
                normal: number,
                hard: number,
                harder: number,
                insane: number,
                daily: number,
                gauntlet: number
            },
            platformer_stats: {
                auto: number,
                easy: number,
                normal: number,
                hard: number,
                harder: number,
                insane: number
            }
        }>(),

    // Technical
    registerDate: timestamp("regDate").notNull().defaultNow(),
    accessDate: timestamp("accessDate").notNull().defaultNow(),
    lastIP: text("lastIP").notNull().default("Unknown"),
    gameVersion: integer("gameVer").notNull().default(20),
    levelsCompleted: integer("lvlsCompleted").notNull().default(0),
    special: integer("special").notNull().default(0),
    protectMeta: jsonb("protect_meta").notNull()
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
    protectLevelsToday: integer("protect_levelsToday").notNull().default(0),
    protectTodayStars: integer("protect_todayStars").notNull().default(0),


    // Relationships
    isBanned: integer("isBanned").notNull().default(1),
    blacklistedUsers: commaSeparated("blacklist"),
    friendsCount: integer("friends_cnt").notNull().default(0),
    friendshipIds: commaSeparated("friendship_ids"),

    // Settings
    iconType: integer("iconType").notNull().default(0),
    vessels: jsonb("vessels").notNull()
        .$type<{
            clr_primary: number, clr_secondary: number, clr_glow: number,
            cube: number, ship: number, ball: number, ufo: number, wave: number, robot: number,
            spider: number, swing: number, jetpack: number, trace: number, death: number
        }>()
        .default({
            clr_primary: 0, clr_secondary: 0, clr_glow: 0,
            cube: 0, ship: 0, ball: 0, ufo: 0, wave: 0, robot: 0,
            spider: 0, swing: 0, jetpack: 0, trace: 0, death: 0
        }),
    chests: jsonb("chests").notNull()
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
    settings: jsonb("settings").notNull()
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

export const usersRelation = relations(usersTable, ({one, many}) => ({
    role: one(rolesTable, {
        fields: [usersTable.roleId],
        references: [rolesTable.id]
    }),
    accountComments: many(accountCommentsTable),
    comments: many(commentsTable),
    levels: many(levelsTable),
}))

