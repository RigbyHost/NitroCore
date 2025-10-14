import {defineDriver, normalizeKey, joinKeys} from "unstorage";
import {EdgeConfigClient, createClient} from "@vercel/edge-config"

export default defineNitroPlugin(() => {
    if (useRuntimeConfig().platform === "vercel")
        useStorage().mount("config", storageDriver({}))
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