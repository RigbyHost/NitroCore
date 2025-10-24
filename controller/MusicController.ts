import {songsTable} from "~~/drizzle";
import {desc, sum} from "drizzle-orm";

export class MusicController {
    private readonly db: Database

    constructor(db: Database) {
        this.db = db
    }

    get $db() {
        return this.db
    }

    getSong = async (id: number) => useSDK().music.getMusic(id)

    getSongBulk = async (ids: number[]) => useSDK().music.getMusicBulk(ids)

    getTopArtists = async (page: number) => {
        const expr = this.db
            .selectDistinct({
                artist: songsTable.artist,
                downloads: sum(songsTable.downloads)
            })
            .from(songsTable)
            .groupBy(songsTable.artist)
            .orderBy(desc(sum(songsTable.downloads)))

        const artists = await expr
            .limit(20)
            .offset(page * 20)

        const total = await this.db.$count(expr)

        return {
            artists: artists.map(a=>a.artist),
            total: total
        }
    }
}