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

import {UserController} from "~~/controller/UserController";
import {z} from "zod";
import {User} from "~~/controller/User";
import {defineEventHandler, type H3Event} from 'nitro/h3';;

export const authMiddleware = defineEventHandler(async event => {
    const userCtx = new UserController(event.context.drizzle!)
    const user = await userCtx.performGJPAuth(event)
    if (!user)
        return await event.context.connector.error(event, -2, "Invalid credentials")
    event.context.user = user
})

export const authHook = defineEventHandler(async event => {
    const userCtx = new UserController(event.context.drizzle!)
    const user = await userCtx.performGJPAuth(event)
    if (!user)
        return false
    event.context.user = user
    return true
})

export const authLoginMiddleware = defineEventHandler(async event => {
    const userController = new UserController(event.context?.drizzle)
    const post = usePostObject<z.infer<typeof authRequestSchema>>(await withPreparsedForm(event))
    const {data, success, error} = authRequestSchema.safeParse(post)

    if (!success)
        return await event.context.connector.error(event, -1, "Bad request")

    let user: Nullable<User> = null

    if (data.gameVersion === "22") {
        user = await userController.performGJPAuth(event)
    } else {
        const uid = await userController.logIn(
            data?.userName,
            data?.password,
            event.context.clientAddress!,
        ).then(c => c?.code)
        if (uid > 0)
            user = await userController.getOneUser({uid})
    }

    if (!user)
        return await event.context.connector.error(event, -2, "Invalid credentials")

    event.context.user = user
})

export const authRequestSchema = z.object({
    userName: z.string().nonempty().optional().default("").transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    password: z.string().nonempty().optional().default("").transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    gameVersion: z.string().nonempty().optional().default("21"),
})