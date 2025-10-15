import {User} from "~~/controller/User";

export const GDConnectorScores = {
    getLeaderboard: async (users: User[]) => {

        await send(
            useEvent(),
            users.map(
                (user, pos) => [
                    1, user.$.username,
                    2, user.$.uid,
                    3, user.$.stars,
                    4, user.$.demons,
                    6, pos+1,
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
                    46, user.$.diamonds,
                    52, user.$.moons,
                ].join(":")
            ).join("|")
        )
    }
}