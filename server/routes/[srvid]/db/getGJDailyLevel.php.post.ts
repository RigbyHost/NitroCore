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
import {QuestsController} from "~~/controller/QuestsController";
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

        let variant = "daily"
        if (data.weekly === 1)
            variant = "weekly"

        if (data?.type) {
            variant = "daily"
            if (data.type === 1)
                variant = "weekly"
            if (data.type === 2)
                variant = "event"
        }

        const questController = new QuestsController(event.context?.drizzle)
        const quest = await questController.getOneQuest({
            type: variant as "weekly" | "daily" | "event"
        })
        if (!quest)
            return await event.context.connector.error(event, -2, "Quest not found")

        const date = quest.timeAdded
        date.setHours(0, 0, 0, 0)
        date.setDate(date.getDate() + (variant === "daily" ? 1 : 7))

        const left = Math.floor(Math.max(0, quest?.timeAdded.getTime() - Date.now()) / 1000)

        await event.context.connector?.quests.getSpecialLevel(
            quest?.id,
            left
        )
    }
)


export const requestSchema = z.object({
    weekly: z?.coerce.number().optional().default(0),
    type: z?.coerce.number().optional()
})