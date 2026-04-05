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

import {validateSrvIdMiddleware} from "~/gdps_middleware/helpers/validate_srvid";
import {getServerConfigMiddleware} from "~/gdps_middleware/helpers/get_serverconfig";
import {checkIPBansMiddleware} from "~/gdps_middleware/helpers/check_ip_bans";
import {getDrizzleMiddleware} from "~/gdps_middleware/helpers/get_drizzle";
import {initConnectorMiddleware} from "~/gdps_middleware/helpers/init_connector";
import {defineEventHandler, type H3Event} from 'nitro/h3';;

export const initMiddleware = defineEventHandler((event: H3Event) => {
    // Run middleware in sequence
    validateSrvIdMiddleware(event)
    getServerConfigMiddleware(event) 
    checkIPBansMiddleware(event)
    getDrizzleMiddleware(event)
    initConnectorMiddleware(event)
})