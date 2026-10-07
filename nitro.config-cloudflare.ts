// https://nitro.build/config
import {defineConfig} from "nitro";
export default defineConfig({
    compatibilityDate: "2025-10-10",
    srcDir: "server",
    preset: "cloudflare-worker",
    cloudflare: {
        deployConfig: true,
        nodeCompat: true
    },
    routeRules: {
        "/**": {cors: true}
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
