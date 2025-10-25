import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {FriendshipController} from "~~/controller/FriendshipController";


export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],

    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success} = requestSchema.safeParse(post)
        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const friendshipController = new FriendshipController(event.context.drizzle)
        const user = event.context.user!
        const reqs = await friendshipController.getFriendRequests(
            user.$.uid,
            data.getSent ? "sent" : "received",
            data.page
        )

        if (!reqs.length)
            return await event.context.connector.error(-2, "No friend requests")

        return await event.context.connector.profile.getFriendRequests(
            reqs,
            data.getSent ? "sent" : "received",
            reqs.length,
            data.page
        )
    }
})

export const requestSchema = z.object({
    getSent: z.coerce.number().optional().default(0),
    page: z.coerce.number().nonnegative().optional().default(0),

})