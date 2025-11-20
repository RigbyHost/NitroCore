import {IConnector, IFriendRequest} from "~/connectors/IConnector";
import {User} from "~~/controller/User";
import {GDConnectorComments} from "~/connectors/GeometryDash/comments";
import {GDConnectorMessages} from "~/connectors/GeometryDash/messages";
import {GDConnectorLevels} from "~/connectors/GeometryDash/levels";
import {GDConnectorScores} from "~/connectors/GeometryDash/scores";
import {GDConnectorQuests} from "~/connectors/GeometryDash/quests";
import {songsTable} from "~~/drizzle";
import {GDConnectorProfile} from "~/connectors/GeometryDash/profile";


export class GDConnector implements IConnector {

    constructor() {
    }

    success = async (message: string) => {
        setHeader(useEvent(), "X-Message", message)
        console.log(`↳ ${message}`)
        await send(useEvent(), "1")
    }

    numberedSuccess = async (code: number, message: string) => {
        setHeader(useEvent(), "X-Message", message)
        console.log(`↳ ${message} (code: ${code})`)
        await send(useEvent(), code.toString())
    }

    error = async (code: number, message: string) => {
        setHeader(useEvent(), "X-Message", message)
        console.log(`↳ ${message} (code: ${code})`)
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

    levels = GDConnectorLevels

    scores = GDConnectorScores

    quests = GDConnectorQuests

    profile = GDConnectorProfile

    getSongInfo = async (music: typeof songsTable.$inferSelect) => {
        await send(
            useEvent(),
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
        await send(
            useEvent(),
            artists.map(artist => `4:${artist}`).join("|")
        )
    }
}