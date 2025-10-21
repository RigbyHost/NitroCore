import {integer, json, pgTable, serial, text} from "drizzle-orm/pg-core";

export const rolesTable = pgTable("roles", {
    // Primary
    id: serial("id").primaryKey(),
    roleName: text("roleName").notNull().default("Moderator"),
    commentColor: text("commentColor").notNull().default("0,0,255"),
    modLevel: integer("modLevel").notNull().default(1),
    privileges: json("privs").notNull()
        .$type<{
            cRate: boolean,
            cFeature: boolean,
            cEpic: boolean,
            cVerCoins: boolean,
            cDaily: boolean,
            cWeekly: boolean,
            cDelete: boolean,
            cLvlAccess: boolean,
            aRateDemon: boolean,
            aRateReq: boolean,
            aRateStars: boolean,
            aReqMod: boolean
        }>()
        .default({
            cRate: false,
            cFeature: false,
            cEpic: false,
            cVerCoins: false,
            cDaily: false,
            cWeekly: false,
            cDelete: false,
            cLvlAccess: false,
            aRateDemon: false,
            aRateReq: false,
            aRateStars: false,
            aReqMod: false
        })
})