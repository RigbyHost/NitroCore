
export const getDrizzleMiddleware = defineEventHandler(async event => {
    if (!event.context.wantsGDPS)
        throw createError({
            statusCode: 404,
            message: "Not found"
        })
    event.context.drizzle = await useDrizzle()
})