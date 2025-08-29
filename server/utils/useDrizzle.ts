import {drizzle} from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "~~/drizzle"

/**
 * Creates a drizzle instance for a specific server depending on `srvid` router param from {@link H3Event}
 *
 * @returns Drizzle instance for the specified server
 */
export const useDrizzle = async () => {
    const srvid = getRouterParam(useEvent(), "srvid")!
    const d = await useDatabase("default").getInstance() as mysql.Connection
    await d.changeUser({database: `gdps_${srvid}`})
    return drizzle(d, {
        schema,
        mode: "default"
    })
}

export type Database = Awaited<ReturnType<typeof useDrizzle>>