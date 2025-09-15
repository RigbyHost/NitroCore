import {IConnector, IFriendRequest} from "~/connectors/IConnector";
import {User} from "~~/controller/User";
import {GDConnectorComments} from "~/connectors/GeometryDash/comments";
import {GDConnectorMessages} from "~/connectors/GeometryDash/messages";
import {GDConnectorLevels} from "~/connectors/GeometryDash/levels";


export class GDConnector implements IConnector {

    constructor() {
    }

    success = async (message: string) => {
        setHeader(useEvent(), "X-Message", message)
        await send(useEvent(), "1")
    }

    numberedSuccess = async (code: number, message: string) => {
        setHeader(useEvent(), "X-Message", message)
        await send(useEvent(), code.toString())
    }

    error = async (code: number, message: string) => {
        setHeader(useEvent(), "X-Message", message)
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

    comments = GDConnectorComments

    messages = GDConnectorMessages

    getFriendRequests = async (
        requests: IFriendRequest[],
        mode: "sent" | "received",
        count: number,
        page: number
    ) => {
        await send(
            useEvent(),
            requests.map(
                request => {
                    const user = mode === "sent" ? request.receiver : request.sender
                    if (!user)
                        return ""
                    return [
                        1, user.username,
                        2, user.uid,
                        9, new User(null as any, user).getShownIcon(),
                        10, user.vessels.clr_primary,
                        11, user.vessels.clr_secondary,
                        14, user.iconType,
                        15, user.special,
                        16, user.uid,
                        32, request.id,
                        35, request.comment,
                        37, useGeometryDashTooling().getDateAgo(request.uploadDate.getTime()),
                        41, request.isNew ? 1 : 0,
                    ].join(":")
                }
            )
                .join("|")
                .concat(`#${count}:${page * 10}:10`)
        )
    }

    levels = GDConnectorLevels
}