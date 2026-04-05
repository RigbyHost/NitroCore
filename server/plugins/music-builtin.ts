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

import { definePlugin } from "nitro";
import type { SDKMusicProvider } from "~~/sdk/music/MusicProvider";

class HTTPProvider implements SDKMusicProvider {
    getMusicById = async (id: string) => {
        const song = useMusicContext().song!
        return {
            name: song?.name,
            author: song?.artist,
            size: song?.size,
            url: id,
            originalUrl: song?.url
        }
    }

    getBulkMusicById = async (ids: string[]) => {
        const songs = useMusicContext().songs
        return songs.map(song => ({
            name: song?.name || "",
            author: song?.artist || "",
            size: song?.size || 0,
            url: song?.url?.split(/:(.*)/s)?.[1] || "",
            originalUrl: song?.url || ""
        })).filter(song => song.url) // Remove songs without valid URLs
    }
}

export default definePlugin(() => {
    const msdk = useSDK().music
    msdk.registerProvider("http", new HTTPProvider())
})