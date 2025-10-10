import {levelpacksTable} from "~~/drizzle";
import {Level} from "~~/controller/Level";
import {GetOneLevelReturnType} from "~~/controller/LevelController";
import {UserController} from "~~/controller/UserController";


export const GDConnectorLevels = {
    getMapPacks: async (
        mappacks: typeof levelpacksTable.$inferSelect[],
        count: number,
        page: number
    ) => {
        let hashstr = ""
        const data = mappacks.map(
            mappack => {
                const id = mappack.id.toString()
                hashstr += `${id[0]}${id[id.length - 1]}${mappack.packStars}${mappack.packCoins}`
                return [
                    1, mappack.id,
                    2, mappack.packName,
                    3, mappack.levels.join(","),
                    4, mappack.packStars,
                    5, mappack.packCoins,
                    6, mappack.packDifficulty,
                    7, mappack.packColor,
                    8, mappack.packColor
                ].join(":")
            }
        ).join("|")
        await send(
            useEvent(),
            `${data}#${count}:${page * 10}:10#${useGeometryDashTooling().hashSolo2(hashstr)}`
        )
    },

    getGauntlets: async (
        gauntlets: typeof levelpacksTable.$inferSelect[],
    ) => {
        let hashstr = ""
        const data = gauntlets.map(
            gauntlet => {
                hashstr += `${gauntlet.packName}${gauntlet.levels.join(",")}`
                return [
                    1, gauntlet.packName,
                    3, gauntlet.levels.join(","),
                ].join(":")
            }
        ).join("|")

        await send(
            useEvent(),
            `${data}#${useGeometryDashTooling().hashSolo2(hashstr)}`
        )
    },

    getFullLevel: async (
        level: Level<GetOneLevelReturnType>,
        password: string,
        passwordHashable: string,
        questID: number = 0,
    ) => {
        let hashstr = [
            level.$.ownerUid,
            level.$.starsGot,
            level.$.demonDifficulty >= 0 ? 1 : 0,
            level.$.id,
            level.$.coins > 0 ? 1 : 0,
            level.$.isFeatured ? 1 : 0,
            passwordHashable,
            questID
        ].join(",")

        let sfxSongs = level.$.stringSettings.split(";")
        if (sfxSongs.length < 2)
            sfxSongs.push("")

        const data = [
            1, level.$.id,
            2, level.$.name,
            3, level.$.description,
            4, level.$.stringLevel || "",
            5, level.$.version,
            6, level.$.ownerUid,
            8, level.$.difficulty > 0 ? 10 : 0,
            9, Math.max(level.$.difficulty, 0),
            10, level.$.downloads,
            12, level.$.trackId,
            13, level.$.versionGame,
            14, level.$.likes,
            15, level.$.length,
            17, level.$.demonDifficulty >= 0 ? 1 : 0,
            18, level.$.starsGot,
            19, level.$.isFeatured ? 1 : 0,
            25, level.$.difficulty < 0 ? 1 : 0,
            26, level.$.stringLevelInfo,
            27, password,
            28, useGeometryDashTooling().getDateAgo(level.$.uploadDate.getTime()),
            29, useGeometryDashTooling().getDateAgo(level.$.updateDate.getTime()),
            30, level.$.originalId,
            31, level.$.is2player ? 1 : 0,
            35, level.$.songId,
            36, level.$.expandableStore?.extra_string || "",
            37, level.$.userCoins,
            38, level.$.coins > 0 ? 1 : 0,
            39, level.$.starsRequested,
            40, level.$.isLDM ? 1 : 0,
            42, level.$.epicness,
            43, level.$.demonDifficulty >= 0 ? level.$.demonDifficulty : 3,
            45, level.$.objects,
            46, 1,
            47, 2,
            48, "",
            52, sfxSongs[0],
            53, sfxSongs[1],
            57, level.$.expandableStore?.ts || "",
        ]

        let suffix = ""
        if (questID > 0) {
            data.push(41, questID)
            suffix = `#${level.$.ownerUid}:${level.$.author?.username || "[DELETED]"}:${level.$.ownerUid}`
        }

        await send(
            useEvent(),
            data.join(":")
                .concat(
                    "#", useGeometryDashTooling().hashSolo(level.$.stringLevel || ""),
                    "#", useGeometryDashTooling().hashSolo2(hashstr),
                    suffix
                )
        )
    }
}