export default defineEventHandler(async (event) => {
    const srvid = getRouterParam(event, "srvid")
    if (srvid && srvid.length===4)
        event.context.wantsGDPS = true
})