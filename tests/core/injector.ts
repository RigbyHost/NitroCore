import config from "~~/nitro.config";
import {inject} from "vitest";
import {defaultConfig} from "~/utils/useDrizzle";

config.devStorage!.config = inject("config")

defaultConfig.host = inject("database").host
defaultConfig.port = inject("database").port
defaultConfig.user = inject("database").user
defaultConfig.password = inject("database").password
