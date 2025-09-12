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
    },
    devStorage: {
        savedata: {
            driver: "fs-lite",
            base: "./_savedata"
        },
        config: { // DO NOT REMOVE: AUTOPOPULATED BY VITEST
            driver: "redis",
            host: 'valkey',
            port: 6379,
            password: ''
        }
    }
});
