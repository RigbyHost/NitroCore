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
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {LevelController} from "~~/controller/LevelController";
import {CommentController} from "~~/controller/CommentController";
import {ListController} from "~~/controller/ListController";
import {defineEventHandler, type H3Event} from 'nitro/h3';;

export default defineEventHandler(async (event) => {
    // Apply middleware
    await initMiddleware(event);
    await authMiddleware(event);
    
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success, error} = requestSchema.safeParse(post)
        if (!success) {
            useLogger().warn(JSON.stringify(z.treeifyError(error)))
            return await event.context.connector.error(event, -1, "Bad Request")
        }

        switch (data?.type) {
            case 1:
            {
                const levelController = new LevelController(event.context?.drizzle)
                const level = await levelController.getOneLevel(data?.itemID)
                if (!level)
                    return await event.context.connector.error(event, -1, "Level not found")
                await level.likeLevel(event, event.context.user!.$.uid, data.like ? "like": "dislike")
                return await event.context.connector.success(event, "Level liked")
            }
            case 2:
            {
                const commentController = new CommentController(event.context?.drizzle)
                const comment = await commentController.getOneLevelComment(data?.itemID)
                if (!comment)
                    return await event.context.connector.error(event, -1, "Comment not found")
                await commentController.likeLevelComment(event, comment?.id, event.context.user!.$.uid, data.like ? "like": "dislike")
                return await event.context.connector.success(event, "Comment liked")
            }
            case 3:
            {
                const commentController = new CommentController(event.context?.drizzle)
                const comment = await commentController.getOneAccountComment(data?.itemID)
                if (!comment)
                    return await event.context.connector.error(event, -1, "Comment not found")
                await commentController.likeAccountComment(event, comment?.id, event.context.user!.$.uid, data.like ? "like": "dislike")
                return await event.context.connector.success(event, "Comment liked")
            }
            case 4:
            {
                const listController = new ListController(event.context?.drizzle)
                const list = await listController.getOneList(data?.itemID)
                if (!list)
                    return await event.context.connector.error(event, -1, "List not found")
                await list.likeList(event, event.context.user!.$.uid, data.like ? "like": "dislike")
                return await event.context.connector.success(event, "List liked")
            }
        }
    }
)


export const requestSchema = z.object({
    itemID: z?.coerce.number(),
    type: z?.coerce.number().min(1).max(4),
    like: z?.coerce.number().transform(
        value => value === 1
    )
})