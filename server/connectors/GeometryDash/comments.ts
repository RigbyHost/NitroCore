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

import {accountCommentsTable, commentsTable, rolesTable, usersTable} from "~~/drizzle";
import {type ILevelComment} from "~/connectors/IConnector";
import {User} from "~~/controller/User";

export const GDConnectorComments = {
    getAccountComments: async (
        comments: typeof accountCommentsTable.$inferSelect[],
        count: number,
        page: number
    ) => {
        if (comments.length === 0)
            return "#0:0:0"


        return comments.map(
                comment => [
                    2, comment?.comment,
                    // 3, comment?.uid,
                    4, comment?.likes,
                    5, 0,
                    6, comment?.id,
                    7, comment.isSpam ? 1 : 0,
                    // 8, comment?.uid,
                    9, useGeometryDashTooling().getDateAgo(comment?.postedTime.getTime()),
                ].join("~")
            )
                .join("|")
                .concat(`#${count}:${page * 10}:10`)
    },

    getLevelComments: async (
        comments: ILevelComment[],
        count: number,
        page: number
    ) => {
        if (comments.length === 0)
            return "#0:0:0"

        return comments.map(
                comment => {
                    if (!comment?.author)
                        return ""
                    const user = new User({$db:null} as any, comment?.author)
                    const v = [
                        2, comment?.comment,
                        3, comment?.uid,
                        4, comment?.likes,
                        5, 0,
                        6, comment?.id,
                        7, comment.isSpam ? 1 : 0,
                        8, comment?.uid,
                        9, useGeometryDashTooling().getDateAgo(comment?.postedTime.getTime()),
                        10, comment?.percent,
                        11, comment?.author.role?.modLevel || 0,
                    ]
                    if (comment?.author.role?.commentColor)
                        v.push(12, comment?.author.role?.commentColor)

                    let output = v.join("~")
                    output += [
                        ":1", comment.author?.username,
                        9, user.getShownIcon(),
                        10, comment?.author.vessels?.clr_primary,
                        11, comment?.author.vessels?.clr_secondary,
                        14, comment.author?.iconType,
                        15, comment.author?.special,
                        16, comment.author?.uid,
                    ].join("~")

                    return output
                }
            )
                .join("|")
                .concat(`#${count}:${page * 10}:10`)
    },
    getCommentHistory: async (
        comments: typeof commentsTable.$inferSelect[],
        user: typeof usersTable.$inferSelect,
        role: MaybeUndefined<typeof rolesTable.$inferSelect>,
        count: number,
        page: number
    ) => {
        if (comments.length === 0)
            return "#0:0:0"

        return comments.map(
                comment => {
                    const author = new User({$db:null} as any, user)
                    const v = [
                        2, comment?.comment,
                        3, comment?.uid,
                        4, comment?.likes,
                        5, 0,
                        6, comment?.id,
                        7, comment.isSpam ? 1 : 0,
                        8, comment?.uid,
                        9, useGeometryDashTooling().getDateAgo(comment?.postedTime.getTime()),
                        10, comment?.percent,
                        11, role?.modLevel || 0,
                    ]
                    if (role?.commentColor)
                        v.push(12, role?.commentColor)
                    v.concat([
                        ":1", user?.username,
                        9, author.getShownIcon(),
                        10, user.vessels?.clr_primary,
                        11, user.vessels?.clr_secondary,
                        14, user?.iconType,
                        15, user?.special,
                        16, user?.uid,
                    ])

                    return v.join("~")
                }
            )
                .join("|")
                .concat(`#${count}:${page * 10}:10`)
    },

    commentCommandResult: async (result: string) => {
        return `temp_1_${result}`
    },
}