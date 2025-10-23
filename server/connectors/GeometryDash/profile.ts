import {IFriendRequest} from "~/connectors/IConnector";
import {User} from "~~/controller/User";

export const GDConnectorProfile = {
    getFriendRequests: async (
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
    },

    getUserSearch: async(users: Array<User>, page: number, total: number) => {
        await send(
            useEvent(),
            users.map(
                user => [
                    1, user.$.username,
                    2, user.$.uid,
                    3, user.$.stars,
                    4, user.$.demons,
                    8, user.$.creatorPoints,
                    9, user.getShownIcon(),
                    10, user.$.vessels.clr_primary,
                    11, user.$.vessels.clr_secondary,
                    13, user.$.coins,
                    14, user.$.iconType,
                    15, user.$.special,
                    16, user.$.uid,
                    17, user.$.userCoins,
                    52, user.$.moons,
                ].join(":")
            ).join("|")
            .concat(`#${total}:${page * 10}:10`)
        )
    }
}