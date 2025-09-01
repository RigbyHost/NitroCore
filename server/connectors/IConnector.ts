import {accountCommentsTable, commentsTable, rolesTable, usersTable} from "~~/drizzle";

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
            comments: typeof commentsTable.$inferSelect[],
            count: number,
            page: number
        ) => Promise<void>,
        getCommentHistory: (
            comments: typeof commentsTable.$inferSelect[],
            user: typeof usersTable.$inferSelect,
            role: typeof rolesTable.$inferSelect,
            count: number,
            page: number
        ) => Promise<void>,
    },
}