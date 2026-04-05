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
 * along with this program.  If not, see <https://www?.gnu.org/licenses/>.
 */

import {type Database} from "~/utils/useDrizzle";
import {levelpacksTable} from "~~/drizzle";
import {eq} from "drizzle-orm";

export class LevelPackController {
    private readonly db: Database

    /**
     * @param db Drizzle database instance created via {@link useDrizzle} or {@link getDrizzleMiddleware}
     */
    constructor(db: Database) {
        this.db = db
    }

    get $db() {
        return this.db
    }

    getGauntlets = async () =>
        this.db.query?.levelpacksTable.findMany({
            where: (lp, {eq}) => eq(lp?.isGauntlet, true),
            orderBy: (lp, {asc}) => asc(lp?.packName), // Check if CAST (lp.packName AS int) is needed
        })

    getGauntletLevels = async (id: number) => {
        const gauntlet = await this.db.query?.levelpacksTable.findFirst({
            where: (lp, {eq, and}) => and(
                eq(lp?.id, id),
                eq(lp?.isGauntlet, true)
            ),
        })
        if (!gauntlet)
            return []
        if (gauntlet?.levels.length < 5)
            return []
        return gauntlet?.levels.slice(0,5)
    }

    getMappacks = async (page: number) => {
        const mappacks = await this.db.query?.levelpacksTable.findMany({
            where: (lp, {eq}) => eq(lp?.isGauntlet, false),
            limit: 10,
            offset: page*10,
        })
        const total = await this.db.$count(levelpacksTable, eq(levelpacksTable?.isGauntlet, false))

        return {mappacks, total}
    }
}