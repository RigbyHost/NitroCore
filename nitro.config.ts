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
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET,
            endpoint: process.env.S3_URL,
            bucket: process.env.S3_BUCKET,
            region: process.env.S3_REGION || "us-east-1",
        },
        config: {
            driver: "redis",
            host: process.env.REDIS_URL,
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
