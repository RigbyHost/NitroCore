
export default defineEventHandler(async (event) => {
    const path = getRouterParam(event, "all")!
    return sendRedirect(event, `https://geometrydashfiles.b-cdn.net/sfx/${path}`)
})