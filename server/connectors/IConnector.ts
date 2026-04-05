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

import {
    accountCommentsTable,
    commentsTable,
    friendRequestsTable, levelpacksTable,
    messagesTable, questsTable,
    rolesTable, songsTable,
    usersTable
} from "~~/drizzle";
import type {H3Event} from 'nitro/h3'
import {type LevelWithUser, Level} from "~~/controller/Level";
import {type UserWithRole, User} from "~~/controller/User";
import {ScoresController} from "~~/controller/ScoresController";
import {type ListWithUser, List} from "~~/controller/List";

export interface IConnector {

    error: (event: H3Event, code: number, message: string) => Promise<string>,
    success: (event: H3Event, message: string) => Promise<string>,
    numberedSuccess: (event: H3Event, code: number, message: string) => Promise<string>,
    account: {
        sync: (savedata: string) => Promise<string>,
        login: (uid: number) => Promise<string>,
    },
    comments: {
        getAccountComments: (
            comments: typeof accountCommentsTable.$inferSelect[],
            count: number,
            page: number
        ) => Promise<string>,
        getLevelComments: (
            comments: ILevelComment[],
            count: number,
            page: number
        ) => Promise<string>,
        getCommentHistory: (
            comments: typeof commentsTable.$inferSelect[],
            user: typeof usersTable.$inferSelect,
            role: MaybeUndefined<typeof rolesTable.$inferSelect>,
            count: number,
            page: number
        ) => Promise<string>,
        commentCommandResult: (result: string) => Promise<string>,
    },

    messages: {
        getOneMessage: (
            message: typeof messagesTable.$inferSelect,
            user: typeof usersTable.$inferSelect,
        ) => Promise<string>,
        getAllMessages: (
            messages: IMessage[],
            mode: "sent" | "received",
            count: number,
            page: number
        ) => Promise<string>
    },

    profile: {
        getFriendRequests: (
            request: IFriendRequest[],
            mode: "sent" | "received",
            count: number,
            page: number
        ) => Promise<string>,

        getUserSearch: (users: Array<User>, page: number, total: number) => Promise<string>,

        getUserInfo: (
            user: User<UserWithRole>,
            rank: number,
            isFriend: boolean,
            counters: {
                friend_requests: number,
                messages: number
            }
        ) => Promise<string>,

        getUsersList: (users: Array<User>) => Promise<string>,
    },

    levels: {
        getMapPacks: (
            mappacks: typeof levelpacksTable.$inferSelect[],
            count: number,
            page: number
        ) => Promise<string>,

        getGauntlets: (
            gauntlets: typeof levelpacksTable.$inferSelect[],
        ) => Promise<string>,

        getFullLevel: (
            level: Level<LevelWithUser>,
            password: string,
            passwordHashable: string,
            questID?: number,
        ) => Promise<string>,

        getSearchedLevels: (
            levels: Array<Level<LevelWithUser>>,
            songs: typeof songsTable.$inferSelect[],
            count: number,
            page: number,
            gauntlet: boolean
        ) => Promise<string>,

        getSearchedLists: (
            lists: Array<List<ListWithUser>>,
            count: number,
            page: number,
        ) => Promise<string>
    },

    quests: {
        getChallenges: (
            challenges: typeof questsTable.$inferSelect[],
            uid: number,
            chk: string,
            udid: string
        ) => Promise<string>,

        getRewards: (
            event: H3Event,
            user: User,
            udid: string,
            chk: string,
            smallLeft: number,
            bigLeft: number,
            chestType: number
        ) => Promise<string>,

        getSpecialLevel: (id: number, left: number) => Promise<string>
    },

    scores: {
        getLeaderboard: (users: User[]) => Promise<string>,
        getScoresForLevel: (
            scores: Awaited<ReturnType<ScoresController["getScoresForLevel"]>>,
            mode: "coins" | "attempts" | "default"
        ) => Promise<string>
    },

    getSongInfo: (music: typeof songsTable.$inferSelect) => Promise<string>,
    getTopArtists: (artists: string[], page: number, total: number) => Promise<string>
}

export type ILevelComment = typeof commentsTable.$inferSelect & {
    author?: typeof usersTable.$inferSelect & {
        role?: typeof rolesTable.$inferSelect
    }
}

export type IMessage = typeof messagesTable.$inferSelect & {
    sender?: {username: string},
    receiver?: {username: string}
}

export type IFriendRequest = typeof friendRequestsTable.$inferSelect & {
    sender?: typeof usersTable.$inferSelect,
    receiver?: typeof usersTable.$inferSelect
}