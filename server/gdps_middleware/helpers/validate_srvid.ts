import {HTTPError, defineHandler} from "nitro";
import {getRouterParam} from "nitro/h3";

export const validateSrvIdMiddleware = defineHandler(async (event) => {
    const srvid = getRouterParam(event, "srvid")
    if (srvid && srvid.length===4)
        return
    throw new HTTPError({
        status: 404,
        message: "Not found"
    })
})