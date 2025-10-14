import {
    accountCommentsTable,
    commentsTable,
    friendRequestsTable, levelpacksTable,
    messagesTable, questsTable,
    rolesTable,
    usersTable
} from "~~/drizzle";
import {Level} from "~~/controller/Level";
import {GetOneLevelReturnType} from "~~/controller/LevelController";
import {User} from "~~/controller/User";

export interface IConnector {

    error: (code: number, message: string) => Promise<void>,
    success: (message: string) => Promise<void>,
    numberedSuccess: (code: number, message: string) => Promise<void>,
    account: {
        sync: (savedata: string) => Promise<void>,
        login: (uid: number) => Promise<void>,
    },
    comments: {
        getAccountComments: (
            comments: typeof accountCommentsTable.$inferSelect[],
            count: number,
            page: number
        ) => Promise<void>,
        getLevelComments: (
            comments: ILevelComment[],
            count: number,
            page: number
        ) => Promise<void>,
        getCommentHistory: (
            comments: typeof commentsTable.$inferSelect[],
            user: typeof usersTable.$inferSelect,
            role: MaybeUndefined<typeof rolesTable.$inferSelect>,
            count: number,
            page: number
        ) => Promise<void>,
    },

    messages: {
        getOneMessage: (
            message: typeof messagesTable.$inferSelect,
            user: typeof usersTable.$inferSelect,
        ) => Promise<void>,
        getAllMessages: (
            messages: IMessage[],
            mode: "sent" | "received",
            count: number,
            page: number
        ) => Promise<void>
    },

    getFriendRequests: (
        request: IFriendRequest[],
        mode: "sent" | "received",
        count: number,
        page: number
    ) => Promise<void>,

    levels: {
        getMapPacks: (
            mappacks: typeof levelpacksTable.$inferSelect[],
            count: number,
            page: number
        ) => Promise<void>,

        getGauntlets: (
            gauntlets: typeof levelpacksTable.$inferSelect[],
        ) => Promise<void>,

        getFullLevel: (
            level: Level<GetOneLevelReturnType>,
            password: string,
            passwordHashable: string,
            questID?: number,
        ) => Promise<void>
    },

    quests: {
        getChallenges: (
            challenges: typeof questsTable.$inferSelect[],
            uid: number,
            chk: string,
            udid: string
        ) => Promise<void>
    },

    scores: {
        getLeaderboard: (users: User[]) => Promise<void>
    }
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