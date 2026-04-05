/**
 * NitroCore - GDPS (Geometry Dash Private Server) implementation
 * Copyright (C) 2025 M41den <https://m41den.dev> and Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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