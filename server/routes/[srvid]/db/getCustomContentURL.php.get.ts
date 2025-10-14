export default defineEventHandler( event => {
    const srvid = getRouterParam(event, "srvid")!
    return sendRedirect(event, `https://${getRequestHost(event)}/${srvid}/db/content`, 301)
})