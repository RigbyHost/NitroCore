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

import { type SDKCommandHandler, type SDKCommandHandlerFunction, type SDKCommandHandlerPermission} from "./types";
import {z} from "zod";
import {ctx, type Context} from "./context";
export class SDKCommands {
    private handlers: Map<uuid, SDKCommandHandler> = new Map()
    private commandMap: Map<commandmap, uuid> = new Map()

    constructor() {
    }

    register = (
        type: "level" | "list" | "profile" | "global",
        command: string,
        handler: SDKCommandHandlerFunction,
        permissions?: SDKCommandHandlerPermission
    ) => {
        z.string().min(1).max(64).regex(/^[a-z0-9_:-]+$/gi).parse(command)

        if (this.commandMap.has(`${type}/${command}`))
            throw new Error(`Command "${command}" is already registered for type "${type}"`)

        if (type !== "global" && this.commandMap.has(`global/${command}`))
            throw new Error(`Command "${command}" is already registered as global. If you want to register command for different types, use corresponding type instead of "global"`)

        const uuid = crypto.randomUUID()
        this.handlers.set(uuid, {
            fn: handler,
            permissions
        })
        this.commandMap.set(`${type}/${command}`, uuid)

        return {
            uuid: uuid,
            unregister: () => this.unregisterByUUID(uuid)
        }
    }

    unregister = (
        type: "level" | "list" | "profile" | "global",
        command: string
    ) => {
        const uuid = this.commandMap.get(`${type}/${command}`)
        if (uuid)
            this.unregisterByUUID(uuid)
    }

    unregisterByUUID = (uuid: uuid) => {
        const commandName = this.commandMap.entries().find((entry) => entry[1] === uuid)?.[0]
        this.handlers.delete(uuid)
        if (commandName)
            this.commandMap.delete(commandName)
    }

    invoke = async (
        type: "level" | "list" | "profile" | "global",
        command: string,
        args: string[],
        context: Context
    )=> {
        const uuid = this.commandMap.get(`${type}/${command}`)
        if (!uuid)
            throw new Error(`Command "${command}" not found for type "${type}"`)
        return this.invokeByUUID(uuid, args, context)
    }

    invokeByUUID = async (uuid: uuid, args: string[], context: Context) => {
        const handler = this.handlers.get(uuid)
        if (!handler)
            throw new Error(`Handler with UUID "${uuid}" not found`)
        return await ctx.callAsync(context, async () => {
            const perms = handler.permissions
            if (perms) {
                Object.keys(perms)
                    .map(s => s as keyof SDKCommandHandlerPermission)
                    .forEach((perm) => {
                        // If for some reason user provided key: false
                        if (!perms[perm]) return
                        if (!context.role?.privileges[perm])
                            throw new Error(`User does not have "${perm}" permission to execute this command`)
                    })
            }
            return handler.fn(args);
        })
    }
}


type uuid = string
type commandmap = string