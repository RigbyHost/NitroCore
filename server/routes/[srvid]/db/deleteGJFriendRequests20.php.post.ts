import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {FriendshipController} from "~~/controller/FriendshipController";


export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],

    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success, error} = requestSchema.safeParse(post)
        if (!success) {
            useLogger().warn(JSON.stringify(z.treeifyError(error)))
            return await event.context.connector.error(-1, "Bad Request")
        }

        const friendshipController = new FriendshipController(event.context.drizzle)
        const user = event.context.user!
        if (await friendshipController.deleteFriendRequest(data.requestID, user.$.uid, data.isSender===1))
            return await event.context.connector.success("Friend request removed")
        else
            return await event.context.connector.error(-1, "Friend request not found")
    }
})

export const requestSchema = z.object({
    requestID: z.coerce.number().positive(),
    isSender: z.coerce.number().optional().default(0)
})