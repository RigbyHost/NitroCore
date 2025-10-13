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
    }
});
