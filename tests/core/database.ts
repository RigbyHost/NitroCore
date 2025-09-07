import {MariaDbContainer, StartedMariaDbContainer} from "@testcontainers/mariadb";
import {vi} from "vitest"
import * as schema from "~~/drizzle"
import {drizzle} from "drizzle-orm/mysql2";

export const getMariaDB = () =>
    new MariaDbContainer("mariadb")
        .withRootPassword("root")
        .withDatabase("gdps_0000")
        .withUsername("test")
        .withUserPassword("test")

export const seedDatabase = async (container: StartedMariaDbContainer) => {
    const {createRequire} =
        await vi.importActual<typeof import("node:module")>("node:module")
    const require = createRequire(import.meta.url)
    const {pushMySQLSchema} = require("drizzle-kit/api") as typeof import("drizzle-kit/api")

    const driz = drizzle({
            connection: {uri: container.getConnectionUri(true)}
        })
    const {apply} = await pushMySQLSchema(schema, driz, container.getDatabase())

    await apply()
    driz.$client.end()
}