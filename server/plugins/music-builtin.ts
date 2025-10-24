
export default defineNitroPlugin(() => {
    const msdk = useSDK().music

    msdk.registerProvider("http", new HTTPProvider())
})


class HTTPProvider implements SDKMusicProvider {
    getMusicById = async (id: string) => {
        const song = useMusicContext().song!
        return {
            name: song.name,
            author: song.artist,
            size: song.size,
            url: id,
            originalUrl: song.url
        }
    }

    getBulkMusicById = async (ids: string[]) => {
        const songs = useMusicContext().songs
        return songs.map(song => ({
            name: song.name,
            author: song.artist,
            size: song.size,
            url: song.url.split(":", 1)[1],
            originalUrl: song.url
        }))
    }
}