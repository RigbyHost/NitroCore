import config from "~~/nitro.config";
import {inject} from "vitest";
import {defaultConfig} from "~/utils/useDrizzle";
import {setup as setupNitro} from "nitro-test-utils";

config.devStorage!.config = inject("config")

process.env.STORAGE_HOST = inject("config").host
process.env.STORAGE_PORT = inject("config").port.toString()
process.env.STORAGE_PASSWORD = inject("config").password

defaultConfig.host = inject("database").host
defaultConfig.port = inject("database").port
defaultConfig.user = inject("database").user
defaultConfig.password = inject("database").password

process.env.POSTGRES_HOST = inject("database").host
process.env.POSTGRES_PORT = inject("database").port.toString()
process.env.POSTGRES_USER = inject("database").user
process.env.POSTGRES_PASSWORD = inject("database").password

await setupNitro({
    rootDir: ".",
})