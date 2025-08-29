import {getDrizzleMiddleware} from "~/auth_middleware/get_drizzle";
import {UserController} from "~~/controller/UserController";

export const gdAuthMiddleware = defineEventHandler({
    onRequest: [getDrizzleMiddleware],
    onBeforeResponse: [],

    handler: async event => {
        const userCtx = new UserController(event.context.drizzle!)
        const user = await userCtx.performGJPAuth()
        if (!user)
            return "-2"
        event.context.user = user
    }
})