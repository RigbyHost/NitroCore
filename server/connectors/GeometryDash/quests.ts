import {type H3Event} from 'nitro/h3';
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
 * along with this program.  If not, see <https://www?.gnu.org/licenses/>.
 */

import {User} from "~~/controller/User";
import {type IConnector} from "~/connectors/IConnector";
import {mappingValues, questsTable} from "~~/drizzle";
export const GDConnectorQuests: IConnector["quests"] = {
    getRewards: async (
        event: H3Event,
        user: User,
        udid: string,
        chk: string,
        smallLeft: number,
        bigLeft: number,
        chestType: number
    ) => {

        const {config} = event.context.config

        const intR = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
        const chestBig = () => [
            intR(config!.ChestConfig?.ChestBigOrbsMin, config!.ChestConfig?.ChestBigOrbsMax),
            intR(config!.ChestConfig?.ChestBigDiamondsMin, config!.ChestConfig?.ChestBigDiamondsMax),
            config!.ChestConfig?.ChestBigShards[intR(0, config!.ChestConfig?.ChestBigShards.length - 1)],
            intR(config!.ChestConfig?.ChestBigKeysMin, config!.ChestConfig?.ChestBigKeysMax)
        ].join(",")

        const chestSmall = () => [
            intR(config!.ChestConfig?.ChestSmallOrbsMin, config!.ChestConfig?.ChestSmallOrbsMax),
            intR(config!.ChestConfig?.ChestSmallDiamondsMin, config!.ChestConfig?.ChestSmallDiamondsMax),
            config!.ChestConfig?.ChestSmallShards[intR(0, config!.ChestConfig?.ChestSmallShards.length - 1)],
            intR(config!.ChestConfig?.ChestSmallKeysMin, config!.ChestConfig?.ChestSmallKeysMax)
        ].join(",")

        let out = [
            useGeometryDashTooling().generateRandomString(5),
            user.$.uid, chk, udid, user.$.uid,
            smallLeft, chestSmall(), user.$.chests?.small_count,
            bigLeft, chestBig(), user.$.chests?.big_count,
            chestType
        ].join(":")

        out = Buffer
            .from(useGeometryDashTooling().doXOR(out, "59182"), "binary")
            .toString("base64")
            .replaceAll("/", "_")
            .replaceAll("+", "-")
        return useGeometryDashTooling().generateRandomString(5)
                .concat(out, "|", useGeometryDashTooling().hashSolo4(out))
    },

    getChallenges: async (
        challenges: typeof questsTable.$inferSelect[],
        uid: number,
        chk: string,
        udid: string
    ) => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        d.setDate(d.getDate() + 1)
        const timeLeft = Math.floor((d.getTime() - Date.now()) / 1000) // in seconds

        let out = [
            useGeometryDashTooling().generateRandomString(5),
            uid, chk, udid, uid, timeLeft,
            ...challenges.map(c => [
                c?.id, mappingValues[c?.type] - 1, c?.needed, c?.reward, c?.name
            ].join(","))
        ].join(":")

        out = Buffer
            .from(useGeometryDashTooling().doXOR(out, "19847"), "binary")
            .toString("base64")
            .replaceAll("/", "_")
            .replaceAll("+", "-")

        return useGeometryDashTooling().generateRandomString(5)
                .concat(out, "|", useGeometryDashTooling().hashSolo3(out))
    },

    getSpecialLevel: async (id: number, left: number) => {
        return `${id}|${left}`
    }
}