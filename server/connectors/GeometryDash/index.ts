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
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {type IFriendRequest, type IConnector} from "~/connectors/IConnector";
import {User} from "~~/controller/User";
import {GDConnectorComments} from "~/connectors/GeometryDash/comments";
import {GDConnectorMessages} from "~/connectors/GeometryDash/messages";
import {GDConnectorLevels} from "~/connectors/GeometryDash/levels";
import {GDConnectorScores} from "~/connectors/GeometryDash/scores";
import {GDConnectorQuests} from "~/connectors/GeometryDash/quests";
import {type H3Event, setResponseHeader} from "nitro/h3";
import {songsTable} from "~~/drizzle";
import {GDConnectorProfile} from "~/connectors/GeometryDash/profile";
export class GDConnector implements IConnector {

    constructor() {
    }

    success = async (event: H3Event, message: string) => {
        setResponseHeader(event, "X-Message", message)
        console.log(`↳ ${message}`)
        return "1"
    }

    numberedSuccess = async (event: H3Event, code: number, message: string) => {
        setResponseHeader(event, "X-Message", message)
        console.log(`↳ ${message} (code: ${code})`)
        return code.toString()
    }

    error = async (event: H3Event, code: number, message: string) => {
        setResponseHeader(event, "X-Message", message)
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
                1, music?.id,
                2, music?.name,
                3, 1,
                4, music?.artist,
                5, music?.size.toFixed(2),
                6, "",
                10, encodeURIComponent(music?.url)
            ].join("~|~").replaceAll("#", "")
    }

    getTopArtists = async (artists: string[], page: number, total: number) => {
        return artists.map(artist => `4:${artist}`).join("|")
    }
}