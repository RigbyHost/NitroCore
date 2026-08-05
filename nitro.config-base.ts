// https://nitro.build/config
export default defineNitroConfig({
    compatibilityDate: "2025-10-10",
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
            endpoint: process.env.S3_URL || process.env.S3_ENDPOINT || "https://s3.eu-north-1.amazonaws.com",
            bucket: process.env.S3_BUCKET,
            region: process.env.S3_REGION || "us-east-1",
        },
        config: {
            driver: "redis",
            url: process.env.REDIS_URL,
            family: 4,
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
