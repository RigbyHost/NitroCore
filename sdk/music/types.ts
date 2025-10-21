export interface SDKMusicProvider {
    getMusicById: (id: string) => Promise<SDKMusicReturn>,
    getBulkMusicById: (ids: string[]) => Promise<SDKMusicReturn[]>
}

export type SDKMusicReturn = {
    name: string,
    author: string,
    size: string,
    url: string
}