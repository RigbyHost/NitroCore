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
import {authLoginMiddleware} from "~/gdps_middleware/user_auth";
import {defineEventHandler, type H3Event} from 'nitro/h3';
import {useStorage} from 'nitro/storage';

export default defineEventHandler(async (event) => {
    // Apply middleware
    await initMiddleware(event);
    await authLoginMiddleware(event);
    
    const user = event.context.user!

        const s3 = useStorage("savedata")
        const path = `/gdps_savedata/${event.context.config.config!.ServerConfig?.SrvID}/${user.$.uid}.nsv`

        try {
            const data = await s3.getItem<string>(path)
            if (!data)
                return await event.context.connector.error(event, -1, "Savedata not found")
            return await event.context.connector?.account.sync(data)
        } catch (e) {
            console.error(e)
            return await event.context.connector.error(event, -1, "Failed to sync account")
        }
    }
)