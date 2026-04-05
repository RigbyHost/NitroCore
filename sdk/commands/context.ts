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

import {createContext} from "unctx";
import {User} from "~~/controller/User";
import {Level} from "~~/controller/Level";
import {rolesTable} from "~~/drizzle";
import {List} from "~~/controller/List";
import {AsyncLocalStorage} from "node:async_hooks";
import {type H3Event} from "nitro/h3";

export const ctx = createContext<Context>({
    asyncContext: true,
    AsyncLocalStorage
})

export const useCommandContext = ctx.use

export type Context = {
    drizzle: Database,
    user: User,
    role: Nullable<typeof rolesTable.$inferSelect>,
    level?: Level,
    list?: List,
    event: H3Event
}