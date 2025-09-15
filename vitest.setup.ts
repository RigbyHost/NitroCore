import {getRedis, seedRedis} from "~~/tests/core/redis";
import {getPostgres, seedDatabase} from "~~/tests/core/database";
import c from "tinyrainbow"
import {AbstractStartedContainer} from "testcontainers";
import {TestProject} from "vitest/node";

const PREFIX = c.bgBlue(c.white(" SETUP "))

let containers: AbstractStartedContainer[] = []

export const setup = async (p: TestProject) => {
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

    p.provide("config", {
        host: redis.getHost(),
        port: redis.getPort(),
        password: redis.getPassword()
    })
    p.provide("database", {
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