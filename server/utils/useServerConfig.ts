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


/**
 * Gets the server config for a specific server from {@link H3Event} router param `srvid`
 */
import {getRouterParam, type H3Event} from 'nitro/h3';
import {useStorage} from 'nitro/storage';

export const useServerConfig = async (event: H3Event, serverId?: string): Promise<{
    config: Nullable<ServerConfig>,
    setConfig: (config: ServerConfig) => Promise<void>
}> => {
    /* c8 ignore next */
    const srvid = serverId || getRouterParam(event, "srvid")!
    const storage = useStorage<ServerConfig>("config")
    const config = await storage.getItem(srvid)
    const setConfig = (config: ServerConfig) => storage.setItem(srvid, config)
    return {config, setConfig}
}

export type ServerConfig = {
    ChestConfig: {
        ChestSmallOrbsMin: number,
        ChestSmallOrbsMax: number,
        ChestSmallDiamondsMin: number,
        ChestSmallDiamondsMax: number,
        ChestSmallShards: number[],
        ChestSmallKeysMin: number,
        ChestSmallKeysMax: number,
        ChestSmallWait: number,

        ChestBigOrbsMin: number,
        ChestBigOrbsMax: number,
        ChestBigDiamondsMin: number,
        ChestBigDiamondsMax: number,
        ChestBigShards: number[],
        ChestBigKeysMin: number,
        ChestBigKeysMax: number,
        ChestBigWait: number
    },
    ServerConfig: {
        SrvID: string,
        SrvKey: string,
        MaxUsers: number,
        MaxLevels: number,
        MaxComments: number,
        MaxPosts: number,
        HalMusic: boolean,
        Locked: boolean,
        TopSize: number,
        EnableModules: Record<string, boolean>,
        ModuleConfig: Record<string, unknown> // name: config
    },
    SecurityConfig: {
        DisableProtection: boolean,
        NoLevelLimits: boolean,
        AutoActivate: boolean,
        BannedIPs: string[]
    }
}