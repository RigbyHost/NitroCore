import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {MessageController} from "~~/controller/MessageController";


export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],

    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await readFormData(event))
        const {data, success} = requestSchema.safeParse(post)
        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const messageController = new MessageController(event.context.drizzle)
        const user = event.context.user!
        const messages = await messageController.getManyMessages(user.$.uid, data.page, data.getSent ? "sent" : "received")
        if (!messages.total)
            return await event.context.connector.error(-2, "No messages")

        return await event.context.connector.messages.getAllMessages(
            messages.messages,
            data.getSent ? "sent" : "received",
            messages.total,
            data.page
        )
    }
})

export const requestSchema = z.object({
    getSent: z.coerce.number().optional().default(0),
    page: z.coerce.number().nonnegative().optional().default(0)
})