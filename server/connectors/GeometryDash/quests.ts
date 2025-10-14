import {User} from "~~/controller/User";

export const GDConnectorQuests = {
    getRewards: async (
        user: User,
        udid: string,
        chk: string,
        smallLeft: number,
        bigLeft: number,
        chestType: number
    ) => {

        const {config} = useEvent().context.config

        const intR = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
        const chestBig = () => [
            intR(config!.ChestConfig.ChestBigOrbsMin, config!.ChestConfig.ChestBigOrbsMax),
            intR(config!.ChestConfig.ChestBigDiamondsMin, config!.ChestConfig.ChestBigDiamondsMax),
            config!.ChestConfig.ChestBigShards[intR(0, config!.ChestConfig.ChestBigShards.length - 1)],
            intR(config!.ChestConfig.ChestBigKeysMin, config!.ChestConfig.ChestBigKeysMax)
        ].join(",")

        const chestSmall = () => [
            intR(config!.ChestConfig.ChestSmallOrbsMin, config!.ChestConfig.ChestSmallOrbsMax),
            intR(config!.ChestConfig.ChestSmallDiamondsMin, config!.ChestConfig.ChestSmallDiamondsMax),
            config!.ChestConfig.ChestSmallShards[intR(0, config!.ChestConfig.ChestSmallShards.length - 1)],
            intR(config!.ChestConfig.ChestSmallKeysMin, config!.ChestConfig.ChestSmallKeysMax)
        ]

        const out = [
            useGeometryDashTooling().generateRandomString(5),
            user.$.uid, chk, udid, user.$.uid,
            smallLeft, chestSmall(), user.$.chests.small_count,
            bigLeft, chestBig(), user.$.chests.big_count,
            chestType
        ].join(":")
        await send(
            useEvent(),
            Buffer.from(useGeometryDashTooling().doXOR(out, "59182"), "binary")
                .toString("base64")
                .replaceAll("/", "_")
                .replaceAll("+", "-")
                .concat("|", useGeometryDashTooling().hashSolo4(out))
        )
    }
}