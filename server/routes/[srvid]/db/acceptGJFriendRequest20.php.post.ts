import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {FriendshipController} from "~~/controller/FriendshipController";


export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],

    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await readFormData(event))
        const {data, success} = requestSchema.safeParse(post)
        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const friendshipController = new FriendshipController(event.context.drizzle)
        const user = event.context.user!
        if (await friendshipController.acceptFriendRequest(data.requestID, user.$.uid))
            return await event.context.connector.success("Friend request accepted")
        else
            return await event.context.connector.error(-1, "Friend request not found")
    }
})

const requestSchema = z.object({
    requestID: z.coerce.number().positive()
})