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

import type {User} from "~~/controller/User";
import {IConnector} from "~/connectors/IConnector";

declare module 'nitro/h3' {
    interface H3EventContext {
        config: {
            config: Nullable<ServerConfig>,
            setConfig: (config: ServerConfig) => Promise<void>
        }
        drizzle: Database
        user?: User,
        connector: IConnector,
        _preparsedBody?: FormData,
        clientAddress?: string
    }
}

declare module 'nitro' {
    interface NitroRuntimeConfig {
        platform?: string
    }
}

export default {}