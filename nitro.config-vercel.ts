// https://nitro.build/config
import {defineConfig} from "nitro";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    compatibilityDate: "2025-10-10",
    serverDir: "server",
    alias: {
        "~~": rootDir,
        "~": join(rootDir, "server"),
    },
    routeRules: {
        "/**": {cors: true}
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
