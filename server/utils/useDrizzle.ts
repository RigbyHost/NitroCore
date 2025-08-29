import {drizzle} from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "~~/drizzle"

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