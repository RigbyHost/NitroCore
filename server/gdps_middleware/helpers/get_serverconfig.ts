export const getServerConfigMiddleware = defineEventHandler(async (event) => {
    const c = await useServerConfig()
    if (!c.config || c.config.ServerConfig.Locked)
        throw createError({
            statusCode: 404,
            message: "Not found"
        })

    event.context.config = c
})