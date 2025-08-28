// https://nitro.build/config
export default defineNitroConfig({
    compatibilityDate: "latest",
    srcDir: "server",
    routeRules: {
        "/**": {cors: true}
    },
    experimental: {
        asyncContext: true,
        database: true,
        tasks: true,
    },
    storage: {}, // TODO: Add redis storage,
    database: {
        default: {
            connector: "mysql2",
            options: {
                user: "noone",
                password: "noone",
                host: "gayhost",
                port: "gayport"
            }
        }
    }
});
