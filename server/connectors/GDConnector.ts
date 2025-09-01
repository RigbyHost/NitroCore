import {IConnector} from "~/connectors/IConnector";
import {accountCommentsTable, commentsTable} from "~~/drizzle";


export class GDConnector implements IConnector {

    constructor() {
    }

    success = async (message: string) => {
        await send(useEvent(), "1")
    }

    error = async (code: number, message: string) => {
        await send(useEvent(), "-1")
    }

    account = {
        sync: async (savedata: string) => {
            // savedata already has `savedata;gameVersion;binaryVersion`
            await send(useEvent(), `${savedata};a;a`)
        },

        login: async (uid: number) => {
            await send(useEvent(), `${uid},${uid}`)
        }
    }

    comments = {
        getAccountComments: async (
            comments: typeof accountCommentsTable.$inferSelect[],
            count: number,
            page: number
        ) => {
            if (comments.length === 0)
                return await send(useEvent(), "#0:0:0")


            await send(
                useEvent(),
                comments.map(
                    comment => [
                        2, comment.comment,
                        3, comment.uid,
                        4, comment.likes,
                        5, 0,
                        6, comment.id,
                        7, comment.isSpam ? 1 : 0,
                        9, useGeometryDashTooling().getDateAgo(comment.postedTime.getTime()),
                    ].join("~")
                )
                    .join("|")
                    .slice(0, -1)
                    .concat(`#${count}:${page*10}:10`)
            )
        },

        getLevelComments: async (
            comments: typeof commentsTable.$inferSelect[],
            count: number,
            page: number
        ) => {
            if (comments.length === 0)
                return await send(useEvent(), "#0:0:0")

            let output = ""

            comments.forEach(comment => {

            })
        }
    }
}