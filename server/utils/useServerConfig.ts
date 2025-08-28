
export const useServerConfig = async (): Promise<
    [UseServerConfig|null, (config: UseServerConfig) => void]
> => {
    const srvid = getRouterParam(useEvent(), "srvid")!
    const storage = useStorage<UseServerConfig>()
    const value = await storage.getItem(srvid)
    const setValue = (config: UseServerConfig) => storage.setItem(srvid, config)
    return [value, setValue]
}

type UseServerConfig = {
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