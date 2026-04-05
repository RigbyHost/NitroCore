import { definePlugin } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";
import { useStorage } from "nitro/storage";
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
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {defineDriver, normalizeKey, joinKeys} from "unstorage";
import {createClient} from "@vercel/edge-config"

type EdgeConfigClient = ReturnType<typeof createClient>

export default definePlugin(() => {
    try {
        const runtimeConfig = useRuntimeConfig()
        const platform = runtimeConfig?.platform as unknown as string | undefined
        if (platform === "vercel") {
            const storage = useStorage("config")
            if (storage && typeof storage.mount === "function") {
                storage.mount("config", storageDriver({ url: process.env.EDGE_CONFIG_TOKEN || "" }))
            }
        }
    } catch (error) {
        // Plugin initialization failed, likely in test environment - this is fine
        console.warn("[storage-vercel-edgeconfig] Plugin initialization skipped:", (error as Error).message)
    }
})

const storageDriver = defineDriver<{
    base?: string,
    url?: string
}, EdgeConfigClient>((opts) => {
    const base = normalizeKey(opts?.base)
    const r = (...keys: string[]) => joinKeys(base, ...keys)

    let _client: EdgeConfigClient
    const getClient = () => {
        if (!_client) {
            const url = opts.url || process.env.EDGE_CONFIG
            if (!url)
                throw new Error(`[unstorage] [vercel-edgeconfig] No URL provided and EDGE_CONFIG environment variable not set`)
            _client = createClient(url)
        }
        return _client
    }

    return {
        name: "vercel-edgeconfig",
        getInstance: getClient,
        hasItem: (key) => getClient().has(r(key)),
        getItem: (key) => getClient().get(r(key)),
        getKeys: (_base) => getClient().getAll()
    }
})
