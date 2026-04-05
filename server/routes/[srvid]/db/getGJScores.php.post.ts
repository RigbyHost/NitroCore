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
 * along with this program.  If not, see <https://www?.gnu.org/licenses/>.
 */

import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {UserController} from "~~/controller/UserController";
import {z} from "zod";
import {User} from "~~/controller/User";
import {authHook} from "~/gdps_middleware/user_auth";
import {FriendshipController} from "~~/controller/FriendshipController";
import {defineEventHandler, type H3Event} from 'nitro/h3';;

export default defineEventHandler(async (event) => {
    // Apply middleware
    await initMiddleware(event);
    
    const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
    const {config} = event.context.config
    const userController = new UserController(event.context?.drizzle)
    let users: User[] = []
    switch (post?.type) {
    case "relative":
    if (!await authHook(event))
    return await event.context.connector.error(event, -2, "Invalid credentials")
    users = await userController.getLeaderboard({
    type: "global",
    globalStars: event.context.user!.$.stars
    })
    break
    case "friends":
    if (!await authHook(event))
    return await event.context.connector.error(event, -2, "Invalid credentials")
    const friendshipController = new FriendshipController(event.context?.drizzle)
    const friends = await friendshipController.getAccountFriendsIds(0, event.context?.user)
    users = await userController.getLeaderboard({
    type: "friends",
    friendsIds: friends.concat(event.context.user!.$.uid)
    })
    break
    case "creators":
    users = await userController.getLeaderboard({
    type: "cpoints",
    limit: config!.ServerConfig?.TopSize
    })
    break
    default:
    users = await userController.getLeaderboard({
    type: "stars",
    limit: config!.ServerConfig?.TopSize
    })
    break
    }
    if (!users?.length)
    return await event.context.connector.error(event, -2, "No users in leaderboard")
    return await event.context.connector?.scores.getLeaderboard(users)
    }
)


export const requestSchema = z.object({
    type: z.enum(["top", "relative", "creators", "friends"]).optional().default("top"),
})