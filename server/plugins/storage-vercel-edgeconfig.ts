import {normalizeKey, joinKeys, type Driver} from "unstorage";
import {EdgeConfigClient, createClient} from "@vercel/edge-config"
import {definePlugin} from "nitro";
import {useRuntimeConfig} from "nitro/runtime-config";
import {useStorage} from "nitro/storage";

export default definePlugin(() => {
    if (useRuntimeConfig().platform === "vercel")
        useStorage().mount("config", storageDriver({}))
})

type EdgeConfigDriverOptions = {
    base?: string,
    url?: string
}

// unstorage v2 has no defineDriver(), a driver is a plain factory
const storageDriver = (opts: EdgeConfigDriverOptions): Driver<EdgeConfigDriverOptions, EdgeConfigClient> => {
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
}
