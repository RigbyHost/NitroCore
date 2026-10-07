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
    preset: "bun",
    cloudflare: {
        deployConfig: true,
        nodeCompat: true
    },
    routeRules: {
        "/**": {cors: true}
    },
    runtimeConfig: {
        platform: "standalone"
    },
    experimental: {
        asyncContext: true,
        database: true,
        tasks: true,
    },
    storage: {
        savedata: {
            driver: "fs",
            base: "/savedata"
        },
        config: {
            driver: "fs",
            base: "/config"
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
