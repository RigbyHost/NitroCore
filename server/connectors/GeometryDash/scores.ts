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

import {User} from "~~/controller/User";
import {scoresTable} from "~~/drizzle";
import {ScoresController} from "~~/controller/ScoresController";

export const GDConnectorScores = {
    getLeaderboard: async (users: User[]) => {

        return users.map(
                (user, pos) => [
                    1, user.$.username,
                    2, user.$.uid,
                    3, user.$.stars,
                    4, user.$.demons,
                    6, pos+1,
                    7, user.$.uid,
                    8, user.$.creatorPoints,
                    9, user.getShownIcon(),
                    10, user.$.vessels?.clr_primary,
                    11, user.$.vessels?.clr_secondary,
                    13, user.$.coins,
                    14, user.$.iconType,
                    15, user.$.special,
                    16, user.$.uid,
                    17, user.$.userCoins,
                    46, user.$.diamonds,
                    52, user.$.moons,
                ].join(":")
            ).join("|")
    },

    getScoresForLevel: async (
        scores: Awaited<ReturnType<ScoresController["getScoresForLevel"]>>,
        mode: "coins" | "attempts" | "default"
    ) => {
        const getPercent = (score: typeof scores[0]): number => {
            switch (mode) {
                case "coins": return score.coins
                case "attempts": return score.attempts
                case "default": return score?.percent
            }
        }
        // return "1:" + acc.Uname + ":2:" + s(acc?.Uid) + ":3:" + s(score?.Percent) + ":6:" + s(score?.Ranking) + ":9:" + s(acc.GetShownIcon()) +
        // 		":10:" + s(acc?.ColorPrimary) + ":11:" + s(acc?.ColorSecondary) + ":13:" + s(score?.Coins) + ":14:" + s(acc?.IconType) + ":15:" + s(acc?.Special) +
        // 		":16:" + s(acc?.Uid) + ":42:" + age + "|"
        return scores.map(
                score => [
                    1, score.user?.username,
                    2, score?.uid,
                    3, getPercent(score),
                    6, score?.ranking,
                    9, new User({$db:null} as any, score?.user).getShownIcon(),
                    10, score?.user.vessels?.clr_primary,
                    11, score?.user.vessels?.clr_secondary,
                    13, score?.coins,
                    14, score.user?.iconType,
                    15, score.user?.special,
                    16, score?.uid,
                    42, useGeometryDashTooling().getDateAgo(score?.postedTime.getTime()),
                ].join(":")
            ).join("|")
    }
}