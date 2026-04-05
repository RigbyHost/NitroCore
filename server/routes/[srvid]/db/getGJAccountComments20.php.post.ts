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
import {CommentController} from "~~/controller/CommentController";
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

        const uid = typeof data.accountID === "number"
            ? data.accountID
            : data?.accountID.slice(-1)[0]

        const commentController = new CommentController(event.context?.drizzle)

        const comments = await commentController.getAllAccountComments(uid!, data?.page || 0)
        const count = await commentController.countUserComments(uid)

        return await event.context.connector?.comments.getAccountComments(comments, count, data?.page || 0)
    }
)


export const requestSchema = z.object({
    accountID: z?.coerce.number().positive().or(
        z.array(z?.coerce.number().positive()).min(1).max(2)
    ),
    page: z?.coerce.number().nonnegative().optional().default(0)
})
