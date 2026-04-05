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

import {authMiddleware} from "~/gdps_middleware/user_auth";
import {initMiddleware} from "~/gdps_middleware/init_gdps";
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

        const user = event.context.user!
        user.$.settings = {
            ...user.$.settings,
            ...data
        }
        await user.commit()
        return await event.context.connector.success(event, "Settings updated")
    }
)


export const requestSchema = z.object({
    mS: z?.coerce.number().optional().default(0),
    frS: z?.coerce.number().optional().default(0),
    cS: z?.coerce.number().optional().default(0),
    yt: z.string().optional().default(""),
    twitter: z.string().optional().default(""),
    twitch: z.string().optional().default(""),
})