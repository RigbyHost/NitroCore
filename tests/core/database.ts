/**
 * NitroCore - GDPS (Geometry Dash Private Server) implementation
 * Copyright (C) 2025 M41den <https://m41den.dev> and Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www?.gnu.org/licenses/>.
 */

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