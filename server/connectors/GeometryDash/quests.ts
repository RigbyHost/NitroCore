import {User} from "~~/controller/User";
import {IConnector} from "~/connectors/IConnector";
import {mappingValues, questsTable} from "~~/drizzle";

export const GDConnectorQuests: IConnector["quests"] = {
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
        ].join(",")

        let out = [
            useGeometryDashTooling().generateRandomString(5),
            user.$.uid, chk, udid, user.$.uid,
            smallLeft, chestSmall(), user.$.chests.small_count,
            bigLeft, chestBig(), user.$.chests.big_count,
            chestType
        ].join(":")

        out = Buffer
            .from(useGeometryDashTooling().doXOR(out, "59182"))
            .toString("base64")
            .replaceAll("/", "_")
            .replaceAll("+", "-")
        await send(
            useEvent(),
            useGeometryDashTooling().generateRandomString(5)
                .concat(out, "|", useGeometryDashTooling().hashSolo4(out)
                )
        )
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
        const timeLeft = d.getTime() - Date.now()

        let out = [
            useGeometryDashTooling().generateRandomString(5),
            uid, chk, udid, uid, timeLeft,
            ...challenges.map(c => [
                c.id, mappingValues[c.type] - 1, c.needed, c.reward, c.name
            ].join(","))
        ].join(":")

        out = Buffer
            .from(useGeometryDashTooling().doXOR(out, "19847"), "binary")
            .toString("base64")
            .replaceAll("/", "_")
            .replaceAll("+", "-")

        await send(
            useEvent(),
            useGeometryDashTooling().generateRandomString(5)
                .concat(out, "|", useGeometryDashTooling().hashSolo3(out)
                )
        )
    },

    getSpecialLevel: async (id: number, left: number) => {
        await send(
            useEvent(),
            `${id}|${left}`
        )
    }
}