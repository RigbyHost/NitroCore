export default defineEventHandler( event => {
    const srvid = getRouterParam(event, "srvid")!
    return sendRedirect(event, `https://servers.rigby.host/${srvid}/db`, 301)
})