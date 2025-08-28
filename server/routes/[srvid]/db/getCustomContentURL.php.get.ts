export default defineEventHandler( event => {
    const srvid = getRouterParam(event, "srvid")!
    return sendRedirect(event, `https://gdps.rigby.host/${srvid}/db/content`, 301)
})