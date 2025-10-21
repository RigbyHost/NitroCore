import {SDKMusicProvider, SDKMusicReturn} from "./types";
import {songsTable} from "~~/drizzle";
import {ctx} from "./context";

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

    getMusic = async (id: number): Promise<Nullable<SDKMusicReturn>> => {
        const db = useEvent().context.drizzle
        const music = await db.query.songsTable.findFirst({
            where: (song, {eq}) => eq(song.id, id)
        })
        if (!music) return null

        const arn = music.url.split("::", 1)
        const provider = this.providers.get(arn[0])
        if (!provider) return null

        return ctx.callAsync(
            {
                drizzle: db,
                song: music,
                songs: [music]
            },
            () => provider.getMusicById(arn[1])
        )
    }

    getMusicBulk = async (ids: number[]): Promise<SDKMusicReturn[]> => {
        const db = useEvent().context.drizzle
        const music = await db.query.songsTable.findMany({
            where: (song, {inArray}) => inArray(song.id, ids)
        })
        if (!music.length) return []

        const sortedTracks = new Map<string, typeof music>()
        music.forEach((track) => {
            const arn = track.url.split("::", 1)
            const arr = sortedTracks.get(arn[0]) || []
            sortedTracks.set(arn[0], arr.concat(track))
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
                    s=>s.url.split("::", 1)[1]
                ))
            )
            result.push(...meta)
        }

        return result
    }
}