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
            endpoint: process.env.S3_URL,
            bucket: process.env.S3_BUCKET,
            region: process.env.S3_REGION || "us-east-1",
        },
        config: {
            driver: "redis",
            url: process.env.REDIS_URL,
        }
    }
});
