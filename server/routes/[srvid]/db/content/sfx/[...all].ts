
export default defineEventHandler(async (event) => {
    const path = getRouterParam(event, "all")!
    return redirect(event, `https://geometrydashfiles.b-cdn.net/sfx/${path}`)
})