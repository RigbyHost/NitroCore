import c from "tinyrainbow"
import {definePlugin} from "nitro";
import type {H3EventContext} from "nitro/h3";
import {useLogger} from "~/utils/useLogger";

export default definePlugin(nitro => {
    nitro.hooks.hook("response", (res, event) => {
        const context = event.req.context as H3EventContext
        const url = new URL(event.req.url)
        useLogger().info([
            c.bgGreen(` ${res.status} `),
            c.bgBlue(` ${event.req.method} `),
            c.white((context.clientAddress || "unknown").padEnd(15)),
            " ", c.bold(url.pathname + url.search)
        ].join(""))
    })
})
