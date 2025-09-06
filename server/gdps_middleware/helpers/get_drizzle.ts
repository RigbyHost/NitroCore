
export const getDrizzleMiddleware = defineEventHandler(async event => {
    event.context.drizzle = await useDrizzle()
})