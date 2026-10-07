import {defineHandler} from "nitro";
import {getRequestHost, getRouterParam} from "nitro/h3";

export default defineHandler( event => {
    const srvid = getRouterParam(event, "srvid")!
    return `https://${getRequestHost(event)}/${srvid}/db/content`
})