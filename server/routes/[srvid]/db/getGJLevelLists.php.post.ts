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
import {z} from "zod";
import {ListController} from "~~/controller/ListController";
import {List, type ListWithUser} from "~~/controller/List";
import {authHook} from "~/gdps_middleware/user_auth";
import {FriendshipController} from "~~/controller/FriendshipController";
import {defineEventHandler, type H3Event} from 'nitro/h3';;

const metrics = usePerformance()

export default defineEventHandler(async (event: H3Event) => {
    // Run init middleware
    await initMiddleware(event)
    
    metrics.reset()
    metrics.step("Read & parse body")
    const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
    const {data, success, error} = requestSchema.safeParse(post)

    if (!success) {
        useLogger().warn(JSON.stringify(z.treeifyError(error)))
        return await event.context.connector.error(event, -1, "Bad Request")
    }

    const listController = new ListController(event.context?.drizzle)
        const filter = listController.getFilter()

        metrics.step("Search lists")

        let result: {
            lists: Array<List<ListWithUser>>,
            total: number
        } = {lists: [], total: 0}

        switch (data?.type) {
            case 1:
                result = await filter.searchLists("mostdownloaded", data)
                break
            case 3:
                result = await filter.searchLists("trending", data)
                break
            case 4:
            case 7:
                result = await filter.searchLists("latest", data)
                break
            case 5:
                result = await filter.searchUserLists(data, false)
                break
            case 11:
                result = await filter.searchLists("awarded", data)
                break
            case 12:
                result = await filter.searchUserLists(data, true)
                break
            case 13:
                if (!await authHook(event))
                    return await event.context.connector.error(event, -1, "Not logged in")
                const friendshipController = new FriendshipController(event.context?.drizzle)
                const friends = await friendshipController.getAccountFriendsIds(0, event.context?.user)
                data.followed = friends
                result = await filter.searchUserLists(data, true)
                break
            case 27:
                result = await filter.searchLists("sent", data)
                break
            default:
                result = await filter.searchLists("mostliked", data)
        }

        metrics.step("Send response")
        return await event.context.connector?.levels.getSearchedLists(result?.lists, result?.total, data?.page)
    
    // Add console warn for debugging
    console.warn(metrics.getSteps())
})

export const requestSchema = z.object({
    type: z?.coerce.number().optional().default(0),
    page: z?.coerce.number().nonnegative().optional().default(0),
    str: z.string().optional().default("").transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    diff: z.string().nonempty()
        .regex(/^(\d(?:,\d)*|-)$/) // x,y,z... or - (empty)
        .optional().default("")
        .transform(
            value => value==="-" ? "" : value
        ).transform(
            value => value.split(",")
                .filter(v=>v.trim()) // Cleans empty values
                .map(v=>parseInt(v))
        ),
    demonFilter: z?.coerce.number().nonnegative().optional(),
    star: z?.coerce.number().optional(),
    followed: z.string().nonempty()
        .regex(/^(\d(?:,\d)*|-)$/) // x,y,z... or - (empty)
        .optional().default("")
        .transform(
            value => value==="-" ? "" : value
        ).transform(
            value => value.split(",")
                .filter(v=>v.trim()) // Cleans empty values
                .map(v=>parseInt(v))
        ),
})