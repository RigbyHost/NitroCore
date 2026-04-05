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

import {fileURLToPath} from 'node:url'

// https://nitro.build/config
export default defineNitroConfig({
    compatibilityDate: "2025-10-10",
    srcDir: "server",
    preset: "cloudflare_module",
    alias: {
        "~~": fileURLToPath(new URL('./', import.meta.url)),
        "~": fileURLToPath(new URL('./server', import.meta.url))
    },
    cloudflare: {
        deployConfig: true,
        nodeCompat: true
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
        platform: "cloudflare"
    },
    experimental: {
        asyncContext: true,
        database: true,
        tasks: true,
    },
    storage: {
        savedata: {
            driver: "cloudflare-r2-binding",
            binding: process.env.BUCKET || "BUCKET",
        },
        config: {
            driver: "cloudflare-kv-binding",
            binding: process.env.STORAGE || "STORAGE",
        }
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
