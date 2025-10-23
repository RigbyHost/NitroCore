import {IFriendRequest} from "~/connectors/IConnector";
import {User, UserWithRole} from "~~/controller/User";

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
    },

    getUserInfo: async (
        user: User<UserWithRole>,
        rank: number,
        isFriend: boolean,
        counters: {
            friend_requests: number,
            messages: number
        }
    ) => {

        const demonStat = [
            user.$.extraData?.demon_stats.standard.easy || 0,
            user.$.extraData?.demon_stats.standard.medium || 0,
            user.$.extraData?.demon_stats.standard.hard || 0,
            user.$.extraData?.demon_stats.standard.insane || 0,
            user.$.extraData?.demon_stats.standard.extreme || 0,
            user.$.extraData?.demon_stats.platformer.easy || 0,
            user.$.extraData?.demon_stats.platformer.medium || 0,
            user.$.extraData?.demon_stats.platformer.hard || 0,
            user.$.extraData?.demon_stats.platformer.insane || 0,
            user.$.extraData?.demon_stats.platformer.extreme || 0,
            user.$.extraData?.demon_stats.weekly || 0,
            user.$.extraData?.demon_stats.gauntlet || 0,
        ].join(",")

        const standardStat = [
            user.$.extraData?.standard_stats.auto || 0,
            user.$.extraData?.standard_stats.easy || 0,
            user.$.extraData?.standard_stats.normal || 0,
            user.$.extraData?.standard_stats.hard || 0,
            user.$.extraData?.standard_stats.harder || 0,
            user.$.extraData?.standard_stats.insane || 0,
            user.$.extraData?.standard_stats.daily || 0,
            user.$.extraData?.standard_stats.gauntlet || 0,
        ].join(",")

        const platformerStat = [
            user.$.extraData?.platformer_stats.auto || 0,
            user.$.extraData?.platformer_stats.easy || 0,
            user.$.extraData?.platformer_stats.normal || 0,
            user.$.extraData?.platformer_stats.hard || 0,
            user.$.extraData?.platformer_stats.harder || 0,
            user.$.extraData?.platformer_stats.insane || 0,
        ].join(",")

        await send(
            useEvent(),
            [
                1, user.$.username,
                2, user.$.uid,
                3, user.$.stars,
                4, user.$.demons,
                6, rank,
                7, user.$.uid,
                8, user.$.creatorPoints,
                9, user.getShownIcon(),
                10, user.$.vessels.clr_primary,
                11, user.$.vessels.clr_secondary,
                13, user.$.coins,
                14, user.$.iconType,
                15, user.$.special,
                16, user.$.uid,
                17, user.$.userCoins,
                18, user.$.settings.mS,
                19, user.$.settings.frS,
                20, user.$.settings.youtube,
                21, user.$.vessels.cube,
                22, user.$.vessels.ship,
                23, user.$.vessels.ball,
                24, user.$.vessels.ufo,
                25, user.$.vessels.wave,
                26, user.$.vessels.robot,
                28, user.$.vessels.trace,
                29, 1,
                30, rank,
                31, isFriend ? 1 : 0,
                43, user.$.vessels.spider,
                44, user.$.settings.twitter,
                45, user.$.settings.twitch,
                46, user.$.diamonds,
                48, user.$.vessels.death,
                49, user.$.role?.modLevel||0,
                50, user.$.settings.cS,
                51, user.$.vessels.clr_glow,
                52, user.$.moons,
                53, user.$.vessels.swing,
                54, user.$.vessels.jetpack,
                55, demonStat,
                56, standardStat,
                57, platformerStat,

                38, counters.messages,
                39, counters.friend_requests,
                40, 0,
            ].join(":")

        )
    },

    getUsersList: async (users: Array<User>) => {
        await send(
            useEvent(),
            users.map(
                user => [
                    1, user.$.username,
                    2, user.$.uid,
                    9, user.getShownIcon(),
                    10, user.$.vessels.clr_primary,
                    11, user.$.vessels.clr_secondary,
                    14, user.$.iconType,
                    15, user.$.special,
                    16, user.$.uid,
                    18, user.$.settings.mS,
                    41, 0,
                ].join(":")
            ).join("|")
        )
    }
}