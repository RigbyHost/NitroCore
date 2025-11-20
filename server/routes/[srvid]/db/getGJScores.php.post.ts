import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {UserController} from "~~/controller/UserController";
import {z} from "zod";
import {User} from "~~/controller/User";
import {authHook} from "~/gdps_middleware/user_auth";
import {FriendshipController} from "~~/controller/FriendshipController";

export default defineEventHandler({
    onRequest: [initMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {config} = event.context.config
        const userController = new UserController(event.context.drizzle)
        let users: User[] = []
        switch (post.type) {
            case "relative":
                if (!await authHook(event))
                    return await event.context.connector.error(-2, "Invalid credentials")
                users = await userController.getLeaderboard({
                    type: "global",
                    globalStars: event.context.user!.$.stars
                })
                break
            case "friends":
                if (!await authHook(event))
                    return await event.context.connector.error(-2, "Invalid credentials")
                const friendshipController = new FriendshipController(event.context.drizzle)
                const friends = await friendshipController.getAccountFriendsIds(0, event.context.user)
                users = await userController.getLeaderboard({
                    type: "friends",
                    friendsIds: friends.concat(event.context.user!.$.uid)
                })
                break
            case "creators":
                users = await userController.getLeaderboard({
                    type: "cpoints",
                    limit: config!.ServerConfig.TopSize
                })
                break
            default:
                users = await userController.getLeaderboard({
                    type: "stars",
                    limit: config!.ServerConfig.TopSize
                })
                break
        }
        if (!users.length)
            return await event.context.connector.error(-2, "No users in leaderboard")
        return await event.context.connector.scores.getLeaderboard(users)
    }
})

export const requestSchema = z.object({
    type: z.enum(["top", "relative", "creators", "friends"]).optional().default("top"),
})