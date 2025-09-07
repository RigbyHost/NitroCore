import {ValkeyContainer, StartedValkeyContainer} from "@testcontainers/valkey";
import Redis from "ioredis";


export const getRedis = () =>
    new ValkeyContainer("valkey/valkey")

export const seedRedis = async (container: StartedValkeyContainer) => {
    const client = new Redis({
        host: container.getHost(),
        port: container.getPort()
    })
    await client.set("0000", JSON.stringify({
        ChestConfig: {},
        ServerConfig: {
            SrvID: "0000",
        },
        SecurityConfig: {
            DisableProtection: false,
            NoLevelLimits: false,
            AutoActivate: false,
            BannedIPs: []
        }
    }))

    await client.quit()
}