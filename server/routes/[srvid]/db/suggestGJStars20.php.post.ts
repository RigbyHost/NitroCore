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
import {ActionController} from "~~/controller/ActionController";
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

        const role = await event.context.user!.fetchRole()
        if (!role)
            return await event.context.connector.error(event, -1, "Unauthorized")

        const levelController = new LevelController(event.context?.drizzle)
        const level = await levelController.getOneLevel(data?.levelID)
        if (!level)
            return await event.context.connector.error(event, -1, "Level not found")

        data.stars = Math.min(data?.stars, 10)

        if (role.privileges?.aRateStars) {
            if (data.stars === 10 && !role.privileges?.aRateDemon)
                return await event.context.connector.error(event, -1, "Unauthorized")

            level.rateLevel(data?.stars)
            switch (data?.feature) {
                case 1:
                    level.featureLevel(true)
                    break
                case 2:
                    level.epicLevel("epic")
                    break
                case 3:
                    level.epicLevel("legendary")
                    break
                case 4:
                    level.epicLevel("mythic")
                    break
                default:
                    level.featureLevel(false)
                    break
            }
            await level.commit()
            await levelController.recalculateCreatorPoints(level.$.ownerUid)
            await new ActionController(event.context?.drizzle)
                .registerAction(event, "level_rate", event.context.user!.$.uid, level.$.id, {
                    uname: event.context.user!.$.username,
                    type: `Rate:${data?.stars}`
                })
            if (data.feature > 0)
                await new ActionController(event.context?.drizzle)
                    .registerAction(event, "level_rate", event.context.user!.$.uid, level.$.id, {
                        uname: event.context.user!.$.username,
                        type: "Feature"
                    })
        } else if (role.privileges?.aRateReq) {
            await level.requestRateByModerator(event.context.user!.$.uid, data?.stars, data.feature>0)
        } else {
            return await event.context.connector.error(event, -1, "Unauthorized")
        }

        return await event.context.connector.success(event, "Level rated")
    }
)


export const requestSchema = z.object({
    levelID: z?.coerce.number(),
    feature: z?.coerce.number(),
    stars: z?.coerce.number().nonnegative(),
})