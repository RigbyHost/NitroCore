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

import {type SDKMusicProvider, type SDKMusicReturn} from "./types";
import {songsTable} from "~~/drizzle";
import {ctx} from "./context";
import {type H3Event} from "nitro/h3";
export class SDKMusic {
    private providers: Map<string, SDKMusicProvider> = new Map()

    constructor() {
    }

    registerProvider = (prefix: string, provider: SDKMusicProvider) => {
        if (this.providers.has(prefix))
            throw new Error(`Provider with prefix ${prefix} already registered`)
        this.providers.set(prefix, provider)

        return {
            unregister: () => this.unregisterProvider(prefix)
        }
    }

    unregisterProvider = (prefix: string) => {
        this.providers.delete(prefix)
    }

    // type:id => [PROVIDER:type] => results
    getMusic = async (event: H3Event, id: number): Promise<Nullable<typeof songsTable.$inferSelect>> => {
        const db = event.context.drizzle
        const music = await db.query.songsTable.findFirst({
            where: (song, {eq}) => eq(song?.id, id)
        })
        if (!music) return null

        const arn = music.url.split(/:(.*)/s)
        const providerId = arn?.[0]
        if (!providerId) return null
        
        const provider = this.providers.get(providerId)
        if (!provider) return null

        return {
            ...music,
            ...await ctx.callAsync(
                {
                    drizzle: db,
                    song: music,
                    songs: [music]
                },
                () => provider.getMusicById(arn?.[1] || "")
            )
        }
    }

    // [type:id][] => Parallel[type] => [PROVIDER:type] => results => Aggregate [results]
    //                               ↘  [PROVIDER:type] => results ↗
    getMusicBulk = async (event: H3Event, ids: number[]): Promise<typeof songsTable.$inferSelect[]> => {
        const db = event.context.drizzle
        const music = await db.query.songsTable.findMany({
            where: (song, {inArray}) => inArray(song?.id, ids)
        })
        if (!music?.length) return []

        const sortedTracks = new Map<string, typeof music>()
        music.forEach((track) => {
            const arn = track?.url.split(/:(.*)/s)
            const providerId = arn?.[0]
            if (!providerId) return // Skip tracks without valid provider
            
            const arr = sortedTracks.get(providerId) || []
            sortedTracks.set(providerId, arr.concat(track))
        })

        const result: SDKMusicReturn[] = []

        for (const type of sortedTracks.keys()) {
            const provider = this.providers.get(type)
            if (!provider) continue

            const songs = sortedTracks.get(type)!

            const meta = await ctx.callAsync(
                {
                    drizzle: db,
                    songs: songs
                },
                () => provider.getBulkMusicById(songs.map(
                    s=> s?.url.split(/:(.*)/s)[1]
                ).filter((id): id is string => Boolean(id)))
            )
            result.push(...meta)
        }

        return music.map(
            mus => {
                const resolved = result.find(r => r.originalUrl === mus?.url)
                if (!resolved) return mus
                return {
                    ...mus,
                    ...resolved
                }
            }
        )
    }
}