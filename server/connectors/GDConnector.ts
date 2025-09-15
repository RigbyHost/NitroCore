import {IConnector, IFriendRequest, ILevelComment, IMessage} from "~/connectors/IConnector";
import {accountCommentsTable, commentsTable, levelpacksTable, messagesTable, rolesTable, usersTable} from "~~/drizzle";
import {User} from "~~/controller/User";


export class GDConnector implements IConnector {

    constructor() {
    }

    success = async (message: string) => {
        setHeader(useEvent(), "X-Message", message)
        await send(useEvent(), "1")
    }

    numberedSuccess = async (code: number, message: string) => {
        setHeader(useEvent(), "X-Message", message)
        await send(useEvent(), code.toString())
    }

    error = async (code: number, message: string) => {
        setHeader(useEvent(), "X-Message", message)
        await send(useEvent(), "-1")
    }

    account = {
        sync: async (savedata: string) => {
            // savedata already has `savedata;gameVersion;binaryVersion`
            await send(useEvent(), `${savedata};a;a`)
        },

        login: async (uid: number) => {
            await send(useEvent(), `${uid},${uid}`)
        }
    }

    comments = {
        getAccountComments: async (
            comments: typeof accountCommentsTable.$inferSelect[],
            count: number,
            page: number
        ) => {
            if (comments.length === 0)
                return await send(useEvent(), "#0:0:0")


            await send(
                useEvent(),
                comments.map(
                    comment => [
                        2, comment.comment,
                        3, comment.uid,
                        4, comment.likes,
                        5, 0,
                        6, comment.id,
                        7, comment.isSpam ? 1 : 0,
                        9, useGeometryDashTooling().getDateAgo(comment.postedTime.getTime()),
                    ].join("~")
                )
                    .join("|")
                    .concat(`#${count}:${page * 10}:10`)
            )
        },

        getLevelComments: async (
            comments: ILevelComment[],
            count: number,
            page: number
        ) => {
            if (comments.length === 0)
                return await send(useEvent(), "#0:0:0")

            await send(
                useEvent(),
                comments.map(
                    comment => {
                        if (!comment.author)
                            return ""
                        const user = new User(null as any, comment.author)
                        const v = [
                            2, comment.comment,
                            3, comment.uid,
                            4, comment.likes,
                            5, 0,
                            6, comment.id,
                            7, comment.isSpam ? 1 : 0,
                            8, comment.uid,
                            9, useGeometryDashTooling().getDateAgo(comment.postedTime.getTime()),
                            10, comment.percent,
                            11, comment.author.role?.modLevel || 0,
                        ]
                        if (comment.author.role?.commentColor)
                            v.push(12, comment.author.role.commentColor)
                        v.concat([
                            ":1", comment.author.username,
                            9, user.getShownIcon(),
                            10, comment.author.vessels.clr_primary,
                            11, comment.author.vessels.clr_secondary,
                            14, comment.author.iconType,
                            15, comment.author.special,
                            16, comment.author.uid,
                        ])

                        return v.join("~")
                    }
                )
                    .join("|")
                    .concat(`#${count}:${page * 10}:10`)
            )
        },
        getCommentHistory: async (
            comments: typeof commentsTable.$inferSelect[],
            user: typeof usersTable.$inferSelect,
            role: MaybeUndefined<typeof rolesTable.$inferSelect>,
            count: number,
            page: number
        ) => {
            if (comments.length === 0)
                return await send(useEvent(), "#0:0:0")

            await send(
                useEvent(),
                comments.map(
                    comment => {
                        const author = new User(null as any, user)
                        const v = [
                            2, comment.comment,
                            3, comment.uid,
                            4, comment.likes,
                            5, 0,
                            6, comment.id,
                            7, comment.isSpam ? 1 : 0,
                            8, comment.uid,
                            9, useGeometryDashTooling().getDateAgo(comment.postedTime.getTime()),
                            10, comment.percent,
                            11, role?.modLevel || 0,
                        ]
                        if (role?.commentColor)
                            v.push(12, role.commentColor)
                        v.concat([
                            ":1", user.username,
                            9, author.getShownIcon(),
                            10, user.vessels.clr_primary,
                            11, user.vessels.clr_secondary,
                            14, user.iconType,
                            15, user.special,
                            16, user.uid,
                        ])

                        return v.join("~")
                    }
                )
                    .join("|")
                    .concat(`#${count}:${page * 10}:10`)
            )
        }
    }

    messages = {
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
                    .concat(`#${count}:${page * 10}::10`)
            )
        }
    }

    getFriendRequests = async (
        requests: IFriendRequest[],
        mode: "sent" | "received",
        count: number,
        page: number
    ) => {
        await send(
            useEvent(),
            requests.map(
                request => {
                    const user = mode === "sent" ? request.receiver : request.sender
                    if (!user)
                        return ""
                    return [
                        1, user.username,
                        2, user.uid,
                        9, new User(null as any, user).getShownIcon(),
                        10, user.vessels.clr_primary,
                        11, user.vessels.clr_secondary,
                        14, user.iconType,
                        15, user.special,
                        16, user.uid,
                        32, request.id,
                        35, request.comment,
                        37, useGeometryDashTooling().getDateAgo(request.uploadDate.getTime()),
                        41, request.isNew ? 1 : 0,
                    ].join(":")
                }
            )
                .join("|")
                .concat(`#${count}:${page * 10}:10`)
        )
    }

    levels = {
        getMapPacks: async (
            mappacks: typeof levelpacksTable.$inferSelect[],
            count: number,
            page: number
        ) => {
            let hashstr = ""
            const data = mappacks.map(
                mappack => {
                    const id = mappack.id.toString()
                    hashstr += `${id[0]}${id[id.length-1]}${mappack.packStars}${mappack.packCoins}`
                    return [
                        1, mappack.id,
                        2, mappack.packName,
                        3, mappack.levels.join(","),
                        4, mappack.packStars,
                        5, mappack.packCoins,
                        6, mappack.packDifficulty,
                        7, mappack.packColor,
                        8, mappack.packColor
                    ].join(":")
                }
            ).join("|")
            await send(
                useEvent(),
                `${data}#${count}:${page * 10}:10#${useGeometryDashTooling().hashSolo2(hashstr)}`
            )
        },

        getGauntlets: async (
            gauntlets: typeof levelpacksTable.$inferSelect[],
        ) => {
            let hashstr = ""
            const data = gauntlets.map(
                gauntlet => {
                    hashstr += `${gauntlet.packName}${gauntlet.levels.join(",")}`
                    return [
                        1, gauntlet.packName,
                        3, gauntlet.levels.join(","),
                    ].join(":")
                }
            ).join("|")

            await send(
                useEvent(),
                `${data}#${useGeometryDashTooling().hashSolo2(hashstr)}`
            )
        }
    }
}