
/**
 * Gets the server config for a specific server from {@link H3Event} router param `srvid`
 *
 * @returns `[ServerConfig, setServerConfig]`
 */
export const useServerConfig = async (): Promise<
    [Nullable<ServerConfig>, (config: ServerConfig) => void]
> => {
    const srvid = getRouterParam(useEvent(), "srvid")!
    const storage = useStorage<ServerConfig>()
    const value = await storage.getItem(srvid)
    const setValue = (config: ServerConfig) => storage.setItem(srvid, config)
    return [value, setValue]
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