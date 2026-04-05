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

import {getRedis, seedRedis} from "./tests/core/redis";
import {getPostgres, seedDatabase} from "./tests/core/database";
import c from "tinyrainbow"
import {AbstractStartedContainer} from "testcontainers";
import type {GlobalSetupContext} from "vitest";

const PREFIX = c.bgBlue(c.white(" SETUP "))

let containers: AbstractStartedContainer[] = []

export const setup = async (ctx: GlobalSetupContext) => {
    if (containers.length)
        return
    console.log(`${PREFIX} Starting containers...`)
    const redis = await getRedis().start()
    const postgres = await getPostgres().start()
    console.log(`${PREFIX} Containers started. Waiting 5s for them to be ready...`)
    await new Promise(resolve => setTimeout(resolve, 5000))
    console.log(`${PREFIX} Seeding redis...` )
    await seedRedis(redis)
    console.log(`${PREFIX} Seeding database...`)
    await seedDatabase(postgres)

    containers = [redis, postgres]

    ctx.provide("config", {
        host: redis.getHost(),
        port: redis.getPort(),
        password: redis.getPassword()
    })
    ctx.provide("database", {
        host: postgres.getHost(),
        port: postgres.getPort(),
        user: postgres.getUsername(),
        password: postgres.getPassword()
    })
}

export const teardown = async () => {
    console.log(`${PREFIX} Stopping containers...`)
    for (const container of containers) {
        await container.stop()
    }
}

declare module 'vitest' {
    export interface ProvidedContext {
        config: {
            host: string,
            port: number,
            password: string
        },
        database: {
            host: string,
            port: number,
            user: string,
            password: string
        }
    }
}