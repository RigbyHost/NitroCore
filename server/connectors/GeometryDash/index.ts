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
        const event = useEvent()
        event.res.headers.set("X-Message", message)
        console.log(`↳ ${message}`)
        return "1"
    }

    numberedSuccess = async (code: number, message: string) => {
        const event = useEvent()
        event.res.headers.set("X-Message", message)
        console.log(`↳ ${message} (code: ${code})`)
        return code.toString()
    }

    error = async (code: number, message: string) => {
        const event = useEvent()
        event.res.headers.set("X-Message", message)
        console.log(`↳ ${message} (code: ${code})`)
        return "-1"
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
        return [
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
        return artists.map(artist => `4:${artist}`).join("|")
        )
    }
}