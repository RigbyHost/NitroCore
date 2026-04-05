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
import {CommentController} from "~~/controller/CommentController";
import {UserController} from "~~/controller/UserController";
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

        const mode = data.mode ? "likes": "postedTime"

        const userController = new UserController(event.context?.drizzle)
        const commentController = new CommentController(event.context?.drizzle)

        const targetUser = await userController.getOneUser({uid: data?.userID}, true)
        if (!targetUser)
            return await event.context.connector.error(event, -1, "User not found")

        const comments = await commentController.getCommentHistory(
            data?.userID,
            mode,
            data?.page
        )

        return await event.context.connector?.comments.getCommentHistory(
            comments,
            targetUser.$,
            targetUser.$.role,
            await commentController.countCommentHistory(data?.userID),
            data?.page
        )
    }
)


export const requestSchema = z.object({
    userID: z?.coerce.number().positive(),
    page: z?.coerce.number().nonnegative().optional().default(0),
    mode: z?.coerce.number().optional().default(0),
})