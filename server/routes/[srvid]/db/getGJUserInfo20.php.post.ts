import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {z} from "zod";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {UserController} from "~~/controller/UserController";
import {FriendshipController} from "~~/controller/FriendshipController";
import {MessageController} from "~~/controller/MessageController";

export default defineEventHandler({
    onRequest: [initMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await readFormData(event))
        const {data, success} = requestSchema.safeParse(post)

        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        // Maybe authenticated
        await authMiddleware(event)

        const userController = new UserController(event.context.drizzle)
        const user = await userController.getOneUser({uid: data.targetAccountID}, true)

        if (!user)
            return await event.context.connector.error(-1, "User not found")

        if (event.context.user && user.$.blacklistedUsers?.includes(event.context.user.$.uid))
            return await event.context.connector.error(-1, "User has blacklisted you")

        const friendshipController = new FriendshipController(event.context.drizzle)
        const messageController = new MessageController(event.context.drizzle)
        const isFriend = await friendshipController.isAlreadyFriends(event.context.user!.$.uid, user.$.uid)

        let counters = {
            friend_requests: 0,
            messages: 0
        }
        if (event.context.user!.$.uid === user.$.uid) {
            counters = {
                friend_requests: await friendshipController.countFriendRequests(event.context.user!.$.uid, true),
                messages: await messageController.countMessages(event.context.user!.$.uid, true)
            }
        }

        const rank = await user.getLeaderboardRank()

        return await event.context.connector.profile.getUserInfo(
            user,
            rank,
            isFriend,
            counters
        )
    }
})

export const requestSchema = z.object({
    targetAccountID: z.coerce.number().positive(),
})