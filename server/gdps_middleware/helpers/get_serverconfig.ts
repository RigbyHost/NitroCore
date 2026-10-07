import {HTTPError, defineHandler} from "nitro";
import {useServerConfig} from "~/utils/useServerConfig";

export const getServerConfigMiddleware = defineHandler(async (event) => {
    const c = await useServerConfig()
    if (!c.config || c.config.ServerConfig.Locked)
        throw new HTTPError({
            status: 404,
            message: "Not found"
        })

    event.context.config = c
})