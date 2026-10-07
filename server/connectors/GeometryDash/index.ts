import {IConnector, IFriendRequest} from "~/connectors/IConnector";
import {User} from "~~/controller/User";
import {GDConnectorComments} from "~/connectors/GeometryDash/comments";
import {GDConnectorMessages} from "~/connectors/GeometryDash/messages";
import {GDConnectorLevels} from "~/connectors/GeometryDash/levels";
import {GDConnectorScores} from "~/connectors/GeometryDash/scores";
import {GDConnectorQuests} from "~/connectors/GeometryDash/quests";
import {songsTable} from "~~/drizzle";
import {GDConnectorProfile} from "~/connectors/GeometryDash/profile";
import {HTTPResponse} from "nitro/h3";
import {useDebug} from "~/utils/useDebug";

const withMessage = (body: string, message: string) =>
    new HTTPResponse(body, {headers: {"X-Message": message}})


export class GDConnector implements IConnector {

    constructor() {
    }

    success = async (message: string) => {
        useDebug().log(`↳ ${message}`)
        return withMessage("1", message)
    }

    numberedSuccess = async (code: number, message: string) => {
        useDebug().log(`↳ ${message} (code: ${code})`)
        return withMessage(code.toString(), message)
    }

    error = async (code: number, message: string) => {
        useDebug().log(`↳ ${message} (code: ${code})`)
        return withMessage("-1", message)
    }

    account = {
        sync: async (savedata: string) => {
            // savedata already has `savedata;gameVersion;binaryVersion`
            return `${savedata};a;a`
        },

        login: async (uid: number) => {
            return `${uid},${uid}`
        }
    }

    comments = GDConnectorComments

    messages = GDConnectorMessages

    levels = GDConnectorLevels

    scores = GDConnectorScores

    quests = GDConnectorQuests

    profile = GDConnectorProfile

    getSongInfo = async (music: typeof songsTable.$inferSelect) => {
        return (
            [
                1, music.id,
                2, music.name,
                3, 1,
                4, music.artist,
                5, music.size.toFixed(2),
                6, "",
                10, encodeURIComponent(music.url)
            ].join("~|~").replaceAll("#", "")
        )
    }

    getTopArtists = async (artists: string[], page: number, total: number) => {
        return (
            artists.map(artist => `4:${artist}`).join("|")
        )
    }
}