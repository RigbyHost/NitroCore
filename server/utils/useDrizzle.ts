import {drizzle} from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "~~/drizzle"


const pools: Map<string, mysql.Pool> = new Map()
const defaultConfig: mysql.PoolOptions = {
    host: "localhost",
    user: "root",
    password: "password",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}

/**
 * Creates a drizzle instance for a specific server depending on `srvid` router param from {@link H3Event}
 *
 * @returns Drizzle instance for the specified server
 */
export const useDrizzle = async () => {
    const srvid = getRouterParam(useEvent(), "srvid")!

    if (!pools.has(srvid))
        pools.set(srvid, mysql.createPool({
            ...defaultConfig,
            database: `gdps_${srvid}`
        }))

    return drizzle(pools.get(srvid)!, {
        schema,
        mode: "default"
    })
}

export const useDrizzlePoolManager = () => {
    const closeAll = async () => {
        for (const pool of pools.values())
            await pool.end()
        pools.clear()
    }

    const closeOne = async (srvid: string) => {
       await pools.get(srvid)?.end()
    }

    return {
        closeAll,
        closeOne
    }
}

export type Database = Awaited<ReturnType<typeof useDrizzle>>