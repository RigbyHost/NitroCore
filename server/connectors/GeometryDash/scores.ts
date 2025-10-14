import {User} from "~~/controller/User";

export const GDConnectorScores = {
    getLeaderboard: async (users: User[]) => {

        // c.output += "1:" + acc.Uname + ":2:" + s(acc.Uid) + ":3:" + s(acc.Stars) + ":4:" + s(acc.Demons) + ":6:" + s(lpos) + ":7:" + s(acc.Uid) +
        // 			":8:" + s(acc.CPoints) + ":9:" + s(acc.GetShownIcon()) + ":10:" + s(acc.ColorPrimary) + ":11:" + s(acc.ColorSecondary) + ":13:" + s(acc.Coins) +
        // 			":14:" + s(acc.IconType) + ":15:" + s(acc.Special) + ":16:" + s(acc.Uid) + ":17:" + s(acc.UCoins) + ":46:" + s(acc.Diamonds) + ":52:" + s(acc.Moons) + "|"
        //

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