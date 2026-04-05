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

import {fileURLToPath} from 'node:url'

// https://nitro.build/config
export default defineNitroConfig({
    compatibilityDate: "2026-04-01",
    srcDir: "server",
    alias: {
        "~~": fileURLToPath(new URL('./', import.meta.url)),
        "~": fileURLToPath(new URL('./server', import.meta.url))
    },
    routeRules: {
        "/**": {cors: true}
    },
    imports: {},
    typescript: {
        generateRuntimeConfigTypes: true,
        generateTsConfig: true
    },
    runtimeConfig: {
        platform: "vercel"
    },
    experimental: {
        asyncContext: true,
        database: true,
        tasks: true,
    },
    storage: {
        savedata: {
            driver: "vercel-blob",
            access: "public", // DO NOT CHANGE, THIS IS MANDATORY AND IS NOT A BUG: https://unstorage.unjs.io/drivers/vercel#vercel-blob
            // token: process.env.BLOB_READ_WRITE_TOKEN, // Optional
        },
        // This driver doesn't exist in upstream unstorage, so it is loaded dynamically as storage plugin asn always
        // needs process.env.EDGE_CONFIG
        // config: {
        //     driver: "storage-vercel-edgeconfig",
        //     // url: process.env.EDGE_CONFIG // Optional
        // }
    },
    scheduledTasks: {
        "0 0 * * *": [
            "nightly:refresh_sfx",
            "nightly:count_music_downloads",
            "nightly:reset_user_limits",
            "nightly:train_level_model"
        ]
    }
});
