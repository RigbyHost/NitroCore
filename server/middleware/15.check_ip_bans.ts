export default defineEventHandler(async (event) => {
    const ip = event.context.clientAddress!
    const banned = event.context.config.config!.SecurityConfig.BannedIPs
    if (banned.includes(ip))
        throw createError({
            statusCode: 403,
            message: "You are banned"
        })
})