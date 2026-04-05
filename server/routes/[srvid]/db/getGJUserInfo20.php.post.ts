/**
 * NitroCore - GDPS (Geometry Dash Private Server) implementation
 * Copyright (C) 2025 M41den <https://m41den.dev> and Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {z} from "zod";
import {authHook} from "~/gdps_middleware/user_auth";
import {UserController} from "~~/controller/UserController";
import {FriendshipController} from "~~/controller/FriendshipController";
import {MessageController} from "~~/controller/MessageController";
import {defineEventHandler, type H3Event} from 'nitro/h3';;

export default defineEventHandler(async (event) => {
    // Apply middleware
    await initMiddleware(event);
    
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success, error} = requestSchema.safeParse(post)

        if (!success) {
            useLogger().warn(JSON.stringify(z.treeifyError(error)))
            return await event.context.connector.error(event, -1, "Bad Request")
        }

        // Maybe authenticated
        await authHook(event)
        const ourUid = event.context.user?.$.uid || 0

        const userController = new UserController(event.context?.drizzle)
        const user = await userController.getOneUser({uid: data?.targetAccountID}, true)

        if (!user)
            return await event.context.connector.error(event, -1, "User not found")

        if (ourUid && user.$.blacklistedUsers?.includes(ourUid))
            return await event.context.connector.error(event, -1, "User has blacklisted you")

        const friendshipController = new FriendshipController(event.context?.drizzle)
        const messageController = new MessageController(event.context?.drizzle)
        const isFriend = ourUid
            ? await friendshipController.isAlreadyFriends(event.context.user!.$.uid, user.$.uid)
            : false

        let counters = {
            friend_requests: 0,
            messages: 0
        }
        if (ourUid === user.$.uid) {
            counters = {
                friend_requests: await friendshipController.countFriendRequests(event.context.user!.$.uid, true),
                messages: await messageController.countMessages(event.context.user!.$.uid, true)
            }
        }

        const rank = await user.getLeaderboardRank()

        return await event.context.connector?.profile.getUserInfo(
            user,
            rank,
            isFriend,
            counters
        )
    }
)


export const requestSchema = z.object({
    targetAccountID: z?.coerce.number().positive(),
})