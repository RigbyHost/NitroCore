import { definePlugin } from "nitro";
import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {defineEventHandler, createError, type H3Event} from 'nitro/h3';

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

export default definePlugin((nitro: any) => {
    const router = nitro?.h3App?.router || nitro?.router
    if (!router) {
        console.warn("[plugin-gdpsswitcher] Router not available, skipping")
        return
    }
    
    router.get(
        "/:srvid/db/switcher/getInfo.php",
        defineEventHandler(async (event) => {
            // Применяем middleware
            await initMiddleware(event);
            
            if (!event.context.config?.config)
                throw createError({
                    statusCode: 404,
                        message: "Not found"
                    })

                const {config} = event.context.config

                if (config?.ServerConfig?.EnableModules["gdpsswitcher"]) {
                    const switcherc = config?.ServerConfig?.ModuleConfig["gdpsswitcher"] as MaybeUndefined<{
                        motd: string,
                        icon: string
                    }>
                    return {
                        motd: switcherc?.motd || "GDPS Server powered by NitroCore",
                        icon: switcherc?.icon || "https://cdn.rigby.host/default_gdps.jpeg",
                        version: 1
                    }
                } else {
                    throw createError({
                        statusCode: 404,
                        message: "Not found"
                    })
                }
            })
        )
})
