import {accountCommentsTable, commentsTable, messagesTable, rolesTable, usersTable} from "~~/drizzle";

export interface IConnector {

    error: (code: number, message: string) => Promise<void>,
    success: (message: string) => Promise<void>,
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
            mode: "sent" | "received"
        ) => Promise<void>
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