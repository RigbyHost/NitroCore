import {HTTPError, defineHandler} from "nitro";

export const checkIPBansMiddleware = defineHandler(async (event) => {
    const ip = event.context.clientAddress!
    const banned = event.context.config.config!.SecurityConfig.BannedIPs
    if (banned.includes(ip))
        throw new HTTPError({
            status: 403,
            message: "You are banned"
        })
})