export default defineEventHandler( event => {
    const srvid = getRouterParam(event, "srvid")!
    return `https://${getRequestHost(event)}/${srvid}/db/content`
})