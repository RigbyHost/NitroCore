import {PostgreSqlContainer, StartedPostgreSqlContainer} from "@testcontainers/postgresql";
import * as schema from "~~/drizzle"
import {drizzle} from "drizzle-orm/node-postgres";
import {sql} from "drizzle-orm";

export const getPostgres = () =>
    new PostgreSqlContainer("postgres:17")
        .withDatabase("gdps_0000")
        .withUsername("test")
        .withPassword("test")

export const seedDatabase = async (container: StartedPostgreSqlContainer) => {
    const {pushSchema} = require("drizzle-kit/api") as typeof import("drizzle-kit/api")

    const driz = drizzle(container.getConnectionUri())
    await driz.execute(sql`CREATE EXTENSION IF NOT EXISTS citext`)
    const {apply} = await pushSchema(schema, driz)

    await apply()
    await driz.$client.end()
}