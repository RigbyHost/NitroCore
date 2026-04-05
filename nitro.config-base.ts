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
    serverDir: "server",
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
    experimental: {
        asyncContext: true,
        database: true,
        tasks: true,
    },
    storage: {
        savedata: {
            driver: "s3",
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET,
            endpoint: process.env.S3_URL,
            bucket: process.env.S3_BUCKET,
            region: process.env.S3_REGION || "us-east-1",
        },
        config: {
            driver: "redis",
            url: process.env.REDIS_URL,
        }
    },
    devStorage: {
        savedata: {
            driver: "fs-lite",
            base: "./_savedata"
        },
        config: { // DO NOT REMOVE: AUTOPOPULATED BY VITEST
            driver: "redis",
            host: process.env.STORAGE_HOST || 'valkey',
            port: Number(process.env.STORAGE_PORT) || 6379,
            password: process.env.STORAGE_PASSWORD || ''
        }
    }
});
