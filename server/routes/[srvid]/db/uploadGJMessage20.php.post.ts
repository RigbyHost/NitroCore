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

        if(await messageController.sendMessage({
            uidSrc: user.$.uid,
            uidDest: data.toAccountID,
            message: data.body,
            subject: data.subject,
        }))
            return await event.context.connector.success("Message sent")
        else
            return await event.context.connector.error(-1, "Message failed")
    }
})

export const requestSchema = z.object({
    toAccountID: z.coerce.number().positive(),
    body: z.string().nonempty(),
    subject: z.string().optional().default(""),
})