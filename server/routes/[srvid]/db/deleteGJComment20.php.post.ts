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

        const commentController = new CommentController(event.context?.drizzle)

        if (data.levelID > 0) {
            // Level
            const levelController = new LevelController(event.context?.drizzle)
            const level = await levelController.getOneLevel(data?.levelID)
            if (!level)
                return await event.context.connector.error(event, -1, "Level not found")
            if (level.isOwnedBy(event.context.user!.$.uid))
                await commentController.deleteLevelCommentByOwner(data?.commentID, data?.levelID)
            else
                await commentController.deleteLevelComment(data?.commentID, event.context.user!.$.uid)
        } else {
            const listController = new ListController(event.context?.drizzle)
            const list = await listController.getOneList(data?.levelID)
            if (!list)
                return await event.context.connector.error(event, -1, "List not found")
            if (list.isOwnedBy(event.context.user!.$.uid))
                await commentController.deleteLevelCommentByOwner(data?.commentID, data?.levelID)
            else
                await commentController.deleteLevelComment(data?.commentID, event.context.user!.$.uid)
        }

        return await event.context.connector.success(event, "Comment deleted")
    }
)


export const requestSchema = z.object({
    commentID: z?.coerce.number().positive(),
    levelID: z?.coerce.number()
})