import redisDriver from "unstorage/drivers/redis";

export default defineNitroPlugin(() => {
    const url = process.env.REDIS_URL;
    const host = process.env.REDIS_HOST;
    if (url || host) {
        useStorage().mount("config", redisDriver({
            url,
            host,
            port: Number(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD,
            family: 4,
        }));
    }
});
