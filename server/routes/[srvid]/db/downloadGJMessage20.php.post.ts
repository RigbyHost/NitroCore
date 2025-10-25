import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {MessageController} from "~~/controller/MessageController";


export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],

    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success, error} = requestSchema.safeParse(post)
        if (!success) {
            useLogger().warn(JSON.stringify(z.treeifyError(error)))
            return await event.context.connector.error(-1, "Bad Request")
        }

        const messageController = new MessageController(event.context.drizzle)
        const user = event.context.user!
        const message = await messageController.getOneMessage(data.messageID)

        if (!message)
            return await event.context.connector.error(-1, "Message not found")
        return await event.context.connector.messages.getOneMessage(message, user.$)
    }
})

export const requestSchema = z.object({
    messageID: z.coerce.number().positive()
})