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

        const {config} = event.context.config
        const now = Math.floor(new Date().getTime()/1000)

        let smallChestsLeft = Math.max(0, config!.ChestConfig.ChestSmallWait - 100 + event.context.user!.$.chests.small_time - now)
        let bigChestsLeft = Math.max(0, config!.ChestConfig.ChestSmallWait - 100 + event.context.user!.$.chests.big_time - now)



        switch (data?.rewardType) {
            case 1:
                if (smallChestsLeft > 0)
                    return await event.context.connector.error(event, -2, "Small chests not ready")
                event.context.user!.$.chests.small_count++
                event.context.user!.$.chests.small_time = now
                await event.context.user!.commit()
                smallChestsLeft = config!.ChestConfig.ChestSmallWait
                break
            case 2:
                if (bigChestsLeft > 0)
                    return await event.context.connector.error(event, -2, "Big chests not ready")
                event.context.user!.$.chests.big_count++
                event.context.user!.$.chests.big_time = now
                await event.context.user!.commit()
                bigChestsLeft = config!.ChestConfig.ChestBigWait
                break
        }

        return await event.context.connector?.quests.getRewards(
            event,
            event.context.user!,
            data?.udid,
            data?.chk,
            smallChestsLeft,
            bigChestsLeft,
            data?.rewardType
        )
    }
)


export const requestSchema = z.object({
    chk: z.string().transform(
        value => useGeometryDashTooling().doXOR(
            Buffer.from(value.slice(5), "base64").toString("latin1"),
            "59182"
        )
    ),
    udid: z.string().optional().default(""),
    rewardType: z?.coerce.number().min(0).max(2).optional().default(0),
})
