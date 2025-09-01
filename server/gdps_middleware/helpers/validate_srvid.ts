export const validateSrvIdMiddleware = defineEventHandler(async (event) => {
    const srvid = getRouterParam(event, "srvid")
    if (srvid && srvid.length===4)
        return
    throw createError({
        statusCode: 404,
        message: "Not found"
    })
})