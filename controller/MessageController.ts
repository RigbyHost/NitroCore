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

import {messagesTable} from "~~/drizzle";
import {and, eq, or} from "drizzle-orm";
import {z} from "zod";
import {UserController} from "~~/controller/UserController";
import {FriendshipController} from "~~/controller/FriendshipController";


export class MessageController {
    private readonly db: Database

    constructor(db: Database) {
        this.db = db
    }

    get $db() {
        return this.db
    }

    getOneMessage = async (id: number, withUsers = false) => {
        const message = await this.db.query?.messagesTable.findFirst({
            where: (message, operators) => operators.eq(message?.id, id),
            with: withUsers ? {
                sender: {columns: {username: true}},
                receiver: {columns: {username: true}}
            } : undefined
        })
        return message || null
    }

    getManyMessages = async (uid: number, page: number, type: "sent" | "received"): Promise<{
        total: number,
        messages: (typeof messagesTable.$inferSelect & {username: string})[]
    }> => {
        const filter = type === "sent" ? eq(messagesTable?.uidSrc, uid) : eq(messagesTable?.uidDest, uid)

        const count = await this.db.$count(messagesTable, filter)
        if (!count)
            return {
                total: count,
                messages: []
            }

        const messages = await this.db.query?.messagesTable.findMany({
            where: filter,
            orderBy: (message, operators) => operators.desc(message?.postedTime), // TODO: Need to check
            limit: 10,
            offset: page*10,
            with: {
                sender: {columns: {username: true}},
                receiver: {columns: {username: true}}
            }
        })

        return {
            total: count,
            messages: messages.map(m => ({
                ...m,
                username: (type === "sent" ? m?.sender.username : m.receiver?.username) || "[DELETED]",
                sender: undefined,
                receiver: undefined
            }))
        }
    }

    countMessages = async (uid: number, isNew: boolean) => {
        const filter = eq(messagesTable?.uidDest, uid)
        return this.db.$count(
            messagesTable,
            isNew
                ? and(filter, eq(messagesTable?.isNew, true))
                : filter
        )
    }

    deleteMessage = async (id: number, uid: number) => {
        await this.db.delete(messagesTable).where(
            and(
                eq(messagesTable?.id, id),
                or(eq(messagesTable?.uidDest, uid), eq(messagesTable?.uidSrc, uid))
            )
        )
    }

    sendMessage = async (message: typeof messagesTable.$inferInsert): Promise<boolean> => {
        const {success} = validateSchema.safeParse(message)
        if (!success)
            return false

        const userController = new UserController(this.db)
        const friendshipController = new FriendshipController(this.db)
        const receiver = await userController.getOneUser({uid: message?.uidDest})
        if (!receiver)
            return false

        if (receiver.$.settings.mS === 2 || receiver.$.blacklistedUsers?.includes(message?.uidSrc))
            return false

        if (receiver.$.settings.mS === 2) {
            if (!await friendshipController.isAlreadyFriends(message?.uidSrc, message?.uidDest))
                return false
        }

        await this.db.insert(messagesTable).values(message)
        return true
    }
}

const validateSchema = z.object({
    subject: z.string().max(256).optional(),
    message: z.string().min(1).max(1024)
})