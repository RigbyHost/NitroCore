
/**
 * Gets the server config for a specific server from {@link H3Event} router param `srvid`
 */
export const useServerConfig = async (serverId?: string): Promise<{
    config: Nullable<ServerConfig>,
    setConfig: (config: ServerConfig) => void
}> => {
    const srvid = serverId || getRouterParam(useEvent(), "srvid")!
    const storage = useStorage<ServerConfig>("config")
    const config = await storage.getItem(srvid)
    const setConfig = (config: ServerConfig) => storage.setItem(srvid, config)
    return {config, setConfig}
}

type ServerConfig = {
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
        EnableModules: Record<string, boolean>
    },
    SecurityConfig: {
        DisableProtection: boolean,
        NoLevelLimits: boolean,
        AutoActivate: boolean,
        BannedIPs: string[]
    }
}