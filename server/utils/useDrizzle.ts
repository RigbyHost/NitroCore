import {drizzle, NodePgDatabase} from "drizzle-orm/node-postgres";
import {Pool} from 'pg';
import * as schema from "~~/drizzle"

let privatePool: NodePgDatabase<any>
const pools: Map<string, Pool> = new Map()

export const defaultConfig = {
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // how long to wait when connecting a new client
}

/**
 * Creates a drizzle instance for a specific server depending on `srvid` router param from {@link H3Event}
 *
 * @returns Drizzle instance for the specified server
 */
export const useDrizzle = async (database?: string) => {
    /* v8 ignore next */
    const srvid = database || getRouterParam(useEvent(), "srvid")!

    if (useRuntimeConfig().platform) {
        if (!privatePool) {
            if (process.env.DATABASE_URL) {
                console.log("Detected possible Postgres Neon")
                privatePool = drizzle(process.env.DATABASE_URL, {schema, logger: !!process.env.VERBOSE})
            }
            if (process.env.POSTGRES_URL) {
                console.log("Detected possible Supabase")
                privatePool = drizzle(process.env.POSTGRES_URL, {schema, logger: !!process.env.VERBOSE})
            }
        }
        return privatePool as NodePgDatabase<typeof schema>

    }

    if (!pools.has(srvid)) {
        const pool = new Pool({
            ...defaultConfig,
            database: `gdps_${srvid}`
        });
        pools.set(srvid, pool);
    }

    return drizzle(pools.get(srvid)!, {schema, logger: !!process.env.VERBOSE})
}

export const useDrizzlePoolManager = () => {
    const closeAll = async () => {
        await Promise.all(Array.from(pools.values()).map(pool => pool.end()));
        pools.clear();
    }

    const closeOne = async (srvid: string) => {
        await pools.get(srvid)?.end();
        pools.delete(srvid);
    }

    return {closeAll, closeOne}
}

export type Database = Awaited<ReturnType<typeof useDrizzle>>