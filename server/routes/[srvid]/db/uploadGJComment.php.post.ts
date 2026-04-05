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
import {CommentController} from "~~/controller/CommentController";
import {LevelController} from "~~/controller/LevelController";
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

        const role = await event.context.user!.fetchRole()
        const csdk = useSDK().commands

        if (data.levelID > 0) {
            // Level
            const levelController = new LevelController(event.context?.drizzle)
            const level = await levelController.getOneLevel(data?.levelID)
            if (!level)
                return await event.context.connector.error(event, -1, "Level not found")
            // Decode base64
            const content = Buffer.from(data?.comment, "base64").toString("utf-8")
            if (
                (role || level.isOwnedBy(event.context.user!.$.uid))
                && content.length && content[0] === "!"
            ) {
                try {
                    const cmds = content.slice(1).split(" ") // remove leading ! and split to args
                    const commandName = cmds[0]
                    if (!commandName) {
                        return await event.context.connector.error(event, -1, "Invalid command")
                    }
                    let data = await csdk.invoke(
                        "level", commandName, cmds.slice(1),
                        {
                            event: event,
                            drizzle: event.context?.drizzle,
                            user: event.context.user!,
                            level: level,
                            role: role
                        }
                    )
                    if (!data)
                        data = "Command executed!"
                    return await event.context.connector?.comments.commentCommandResult(data)
                } catch (e) {
                    return await event.context.connector?.comments.commentCommandResult((e as Error).message)
                }
            } else {
                await commentController.postLevelComment(
                    event.context.user!.$.uid,
                    data?.levelID,
                    data?.comment,
                    data?.percent,
                )
            }
        } else {
            const listController = new ListController(event.context?.drizzle)
            const list = await listController.getOneList(data?.levelID)
            if (!list)
                return await event.context.connector.error(event, -1, "List not found")
            // Decode base64
            const content = Buffer.from(data?.comment, "base64").toString("utf-8")
            if (
                (role || list.isOwnedBy(event.context.user!.$.uid))
                && content.length && content[0] === "!"
            ) {
                try {
                    const cmds = content.slice(1).split(" ") // remove leading ! and split to args
                    const commandName = cmds[0]
                    if (!commandName) {
                        return await event.context.connector.error(event, -1, "Invalid command")
                    }
                    let data = await csdk.invoke(
                        "list", commandName, cmds.slice(1),
                        {
                            event: event,
                            drizzle: event.context?.drizzle,
                            user: event.context.user!,
                            list: list,
                            role: role
                        }
                    )
                    if (!data)
                        data = "Command executed!"
                    return await event.context.connector?.comments.commentCommandResult(data)
                } catch (e) {
                    return await event.context.connector?.comments.commentCommandResult((e as Error).message)
                }
            } else {
                await commentController.postLevelComment(
                    event.context.user!.$.uid,
                    data?.levelID,
                    data?.comment,
                    data?.percent,
                )
            }
        }

        return await event.context.connector.success(event, "Comment uploaded")
    }
)


export const requestSchema = z.object({
    levelID: z?.coerce.number(),
    comment: z.string().nonempty().transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    percent: z?.coerce.number().min(0).max(100).optional().default(0),
})