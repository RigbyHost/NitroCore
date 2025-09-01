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
    storage: {
        savedata: {
            driver: "s3",
            accessKeyId: "",
            secretAccessKey: "",
            endpoint: "",
            bucket: "",
            region: "",
        },
        config: {
            driver: "redis",
            host: 'HOSTNAME',
            port: 6380,
            password: 'REDIS_PASSWORD'
        }
    }, // TODO: Add redis storage
    devStorage: {
        savedata: {
            driver: "fs-lite",
            base: "./_savedata"
        },
        config: {
            driver: "memory"
        }
    },
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
