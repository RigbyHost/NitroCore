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
import {z} from "zod";
import {UserController} from "~~/controller/UserController";
import {ActionController} from "~~/controller/ActionController";
import {defineEventHandler, type H3Event} from 'nitro/h3';;

export default defineEventHandler(async (event) => {
    // Apply middleware
    await initMiddleware(event);
    
        const ip = event.context.clientAddress!
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))

        const {data, success, error} = requestSchema.safeParse(post)

        if(!success)
            return await event.context.connector.error(event, -1, "Bad request")

        const userController = new UserController(event.context?.drizzle)
        const {code} = await userController.register({
            username: data?.userName,
            password: data?.password,
            email: data?.email
        }, ip, event.context.config.config!.SecurityConfig?.AutoActivate)

        if (code > 0) {
            await event.context.connector.success(event, "User registered successfully")
            await new ActionController(event.context?.drizzle)
                .registerAction(event, "register_user", 0, code, {uname: data?.userName, email: data?.email})
        } else {
            await event.context.connector.error(event, code, "Failed to register user")
        }
    }
)

export const requestSchema = z.object({
    userName: z.string().nonempty().transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    password: z.string().nonempty().transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    email: z.string().nonempty().transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    )
})