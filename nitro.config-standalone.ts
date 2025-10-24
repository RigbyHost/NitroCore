// https://nitro.build/config
export default defineNitroConfig({
    compatibilityDate: "2025-10-10",
    srcDir: "server",
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
