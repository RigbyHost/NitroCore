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

import {songsTable} from "~~/drizzle";
import {desc, sum} from "drizzle-orm";
import type {H3Event} from "nitro/h3";
import type {Database} from "~/utils/useDrizzle";
import {useSDK} from "~/utils/useSDK";

export class MusicController {
    private readonly db: Database

    constructor(db: Database) {
        this.db = db
    }

    get $db() {
        return this.db
    }

    getSong = async (event: H3Event, id: number) => useSDK().music.getMusic(event, id)

    getSongBulk = async (event: H3Event, ids: number[]) => useSDK().music.getMusicBulk(event, ids)

    getTopArtists = async (page: number) => {
        const expr = this.db
            .selectDistinct({
                artist: songsTable?.artist,
                downloads: sum(songsTable?.downloads)
            })
            .from(songsTable)
            .groupBy(songsTable?.artist)
            .orderBy(desc(sum(songsTable?.downloads)))

        const artists = await expr
            .limit(20)
            .offset(page * 20)

        const total = await this.db.$count(expr)

        return {
            artists: artists.map(a=>a?.artist),
            total: total
        }
    }
}