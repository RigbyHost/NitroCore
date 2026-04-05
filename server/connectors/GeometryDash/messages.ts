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

import {messagesTable, usersTable} from "~~/drizzle";
import {type IMessage} from "~/connectors/IConnector";

export const GDConnectorMessages = {
    getOneMessage: async (
        message: typeof messagesTable.$inferSelect,
        user: typeof usersTable.$inferSelect,
    ) => {
        const uidx = message.uidDest === user.uid ? message.uidSrc : message.uidDest
        return [
                1, message?.id,
                2, uidx,
                3, uidx,
                4, message?.subject,
                5, message?.message,
                6, user?.username,
                7, useGeometryDashTooling().getDateAgo(message?.postedTime.getTime()),
                8, message.isNew ? 1 : 0,
                9, message.uidSrc == user.uid ? 1 : 0,
            ].join(":")
    },

    getAllMessages: async (
        messages: IMessage[],
        mode: "sent" | "received",
        count: number,
        page: number
    ) => {
        return messages.map(
                message => {
                    const uidx = mode === "sent" ? message.uidDest : message.uidSrc
                    return [
                        1, message?.id,
                        2, uidx,
                        3, uidx,
                        4, message?.subject,
                        5, message?.message,
                        6, (mode === "sent" ? message.receiver?.username : message.sender?.username) || "[DELETED]",
                        7, useGeometryDashTooling().getDateAgo(message?.postedTime.getTime()),
                        8, message.isNew ? 0 : 1,
                        9, mode === "sent" ? 1 : 0
                    ].join(":")
                }
            )
                .join("|")
                .concat(`#${count}:${page * 10}:10`)
    }
}