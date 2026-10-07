import {
    accountCommentsTable,
    commentsTable,
    friendRequestsTable, levelpacksTable,
    messagesTable, questsTable,
    rolesTable, songsTable,
    usersTable
} from "~~/drizzle";
import {Level, LevelWithUser} from "~~/controller/Level";
import {User, UserWithRole} from "~~/controller/User";
import {ScoresController} from "~~/controller/ScoresController";
import {List, ListWithUser} from "~~/controller/List";
import type {HTTPResponse} from "nitro/h3";
import {type MaybeUndefined} from "~/utils/types";

/** Response body returned from route handlers, `HTTPResponse` is used when extra headers are needed */
export type ConnectorResponse = string | HTTPResponse

export interface IConnector {

    error: (code: number, message: string) => Promise<ConnectorResponse>,
    success: (message: string) => Promise<ConnectorResponse>,
    numberedSuccess: (code: number, message: string) => Promise<ConnectorResponse>,
    account: {
        sync: (savedata: string) => Promise<ConnectorResponse>,
        login: (uid: number) => Promise<ConnectorResponse>,
    },
    comments: {
        getAccountComments: (
            comments: typeof accountCommentsTable.$inferSelect[],
            count: number,
            page: number
        ) => Promise<ConnectorResponse>,
        getLevelComments: (
            comments: ILevelComment[],
            count: number,
            page: number
        ) => Promise<ConnectorResponse>,
        getCommentHistory: (
            comments: typeof commentsTable.$inferSelect[],
            user: typeof usersTable.$inferSelect,
            role: MaybeUndefined<typeof rolesTable.$inferSelect>,
            count: number,
            page: number
        ) => Promise<ConnectorResponse>,
        commentCommandResult: (result: string) => Promise<ConnectorResponse>,
    },

    messages: {
        getOneMessage: (
            message: typeof messagesTable.$inferSelect,
            user: typeof usersTable.$inferSelect,
        ) => Promise<ConnectorResponse>,
        getAllMessages: (
            messages: IMessage[],
            mode: "sent" | "received",
            count: number,
            page: number
        ) => Promise<ConnectorResponse>
    },

    profile: {
        getFriendRequests: (
            request: IFriendRequest[],
            mode: "sent" | "received",
            count: number,
            page: number
        ) => Promise<ConnectorResponse>,

        getUserSearch: (users: Array<User>, page: number, total: number) => Promise<ConnectorResponse>,

        getUserInfo: (
            user: User<UserWithRole>,
            rank: number,
            isFriend: boolean,
            counters: {
                friend_requests: number,
                messages: number
            }
        ) => Promise<ConnectorResponse>,

        getUsersList: (users: Array<User>) => Promise<ConnectorResponse>,
    },

    levels: {
        getMapPacks: (
            mappacks: typeof levelpacksTable.$inferSelect[],
            count: number,
            page: number
        ) => Promise<ConnectorResponse>,

        getGauntlets: (
            gauntlets: typeof levelpacksTable.$inferSelect[],
        ) => Promise<ConnectorResponse>,

        getFullLevel: (
            level: Level<LevelWithUser>,
            password: string,
            passwordHashable: string,
            questID?: number,
        ) => Promise<ConnectorResponse>,

        getSearchedLevels: (
            levels: Array<Level<LevelWithUser>>,
            songs: typeof songsTable.$inferSelect[],
            count: number,
            page: number,
            gauntlet: boolean
        ) => Promise<ConnectorResponse>,

        getSearchedLists: (
            lists: Array<List<ListWithUser>>,
            count: number,
            page: number,
        ) => Promise<ConnectorResponse>
    },

    quests: {
        getChallenges: (
            challenges: typeof questsTable.$inferSelect[],
            uid: number,
            chk: string,
            udid: string
        ) => Promise<ConnectorResponse>,

        getRewards: (
            user: User,
            udid: string,
            chk: string,
            smallLeft: number,
            bigLeft: number,
            chestType: number
        ) => Promise<ConnectorResponse>,

        getSpecialLevel: (id: number, left: number) => Promise<ConnectorResponse>
    },

    scores: {
        getLeaderboard: (users: User[]) => Promise<ConnectorResponse>,
        getScoresForLevel: (
            scores: Awaited<ReturnType<ScoresController["getScoresForLevel"]>>,
            mode: "coins" | "attempts" | "default"
        ) => Promise<ConnectorResponse>
    },

    getSongInfo: (music: typeof songsTable.$inferSelect) => Promise<ConnectorResponse>,
    getTopArtists: (artists: string[], page: number, total: number) => Promise<ConnectorResponse>
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