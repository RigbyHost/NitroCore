import {int, json, mysqlTable, text} from "drizzle-orm/mysql-core";


export const rolesTable = mysqlTable("roles", {
    // Primary
    id: int("id").autoincrement().primaryKey(),
    roleName: text("roleName").notNull().default("Moderator"),
    commentColor: text("commentColor").notNull().default("0,0,255"),
    modLevel: int("modLevel").notNull().default(1),
    privileges: json("privs").notNull()
        .$type<{
            cRate: number,
            cFeature: number,
            cEpic: number,
            cVerCoins: number,
            cDaily: number,
            cWeekly: number,
            cDelete: number,
            cLvlAccess: number,
            aRateDemon: number,
            aRateReq: number,
            aRateStars: number,
            aReqMod: number
        }>()
        .default({
            cRate: 0,
            cFeature: 0,
            cEpic: 0,
            cVerCoins: 0,
            cDaily: 0,
            cWeekly: 0,
            cDelete: 0,
            cLvlAccess: 0,
            aRateDemon: 0,
            aRateReq: 0,
            aRateStars: 0,
            aReqMod: 0
        })
})