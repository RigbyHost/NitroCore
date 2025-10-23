import {messagesTable, usersTable} from "~~/drizzle";
import {IMessage} from "~/connectors/IConnector";

export const GDConnectorMessages = {
    getOneMessage: async (
        message: typeof messagesTable.$inferSelect,
        user: typeof usersTable.$inferSelect,
    ) => {
        const uidx = message.uidDest === user.uid ? message.uidSrc : message.uidDest
        await send(
            useEvent(),
            [
                1, message.id,
                2, uidx,
                3, uidx,
                4, message.subject,
                5, message.message,
                6, user.username,
                7, useGeometryDashTooling().getDateAgo(message.postedTime.getTime()),
                8, message.isNew ? 1 : 0,
                9, message.uidSrc == user.uid ? 1 : 0,
            ].join(":")
        )
    },

    getAllMessages: async (
        messages: IMessage[],
        mode: "sent" | "received",
        count: number,
        page: number
    ) => {
        await send(
            useEvent(),
            messages.map(
                message => {
                    const uidx = mode === "sent" ? message.uidDest : message.uidSrc
                    return [
                        1, message.id,
                        2, uidx,
                        3, uidx,
                        4, message.subject,
                        5, message.message,
                        6, (mode === "sent" ? message.receiver?.username : message.sender?.username) || "[DELETED]",
                        7, useGeometryDashTooling().getDateAgo(message.postedTime.getTime()),
                        8, message.isNew ? 0 : 1,
                        9, mode === "sent" ? 1 : 0
                    ].join(":")
                }
            )
                .join("|")
                .concat(`#${count}:${page * 10}:10`)
        )
    }
}