
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
}