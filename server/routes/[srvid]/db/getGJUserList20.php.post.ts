import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {UserController} from "~~/controller/UserController";
import {FriendshipController} from "~~/controller/FriendshipController";
import {User} from "~~/controller/User";

export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success} = requestSchema.safeParse(post)

        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const userController = new UserController(event.context.drizzle)
        const friendshipController = new FriendshipController(event.context.drizzle)

        const user = event.context.user!

        let users: Array<User> = []

        switch (data.type) {
            case 0:
                if (!user.$.friendsCount)
                    return await event.context.connector.error(-2, "No friends")

                const friendIds = await friendshipController.getAccountFriendsIds(0, user)
                users = await userController.getManyUsers(friendIds)
                break
            case 1:
                if (!user.$.blacklistedUsers?.length)
                    return await event.context.connector.error(-2, "No blacklisted users")

                users = await userController.getManyUsers(user.$.blacklistedUsers)
                break
        }

        if (!users.length)
            return await event.context.connector.error(-2, "No users")

        return await event.context.connector.profile.getUsersList(users)
    }
})

export const requestSchema = z.object({
    type: z.coerce.number().min(0).max(1).optional().default(0)
})