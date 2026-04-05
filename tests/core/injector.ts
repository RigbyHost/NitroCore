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

import config from "~~/nitro.config";
import {inject} from "vitest";
import {defaultConfig} from "~/utils/useDrizzle";
import {setup as setupNitro} from "nitro-test-utils";

config.devStorage!.config = {
    ...inject("config"),
    driver: "redis"
}

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