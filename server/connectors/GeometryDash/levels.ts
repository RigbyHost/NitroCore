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

        // c.output = "1:" + s(cl.Id) + ":2:" + cl.Name + ":3:" + cl.Description + ":4:" + cl.StringLevel + ":5:" + s(cl.Version) + ":6:" + s(cl.Uid) + ":8:" + s(diffNom) +
        // 		":9:" + s(cl.Difficulty) + ":10:" + s(cl.Downloads) + ":12:" + s(cl.TrackId) + ":13:" + s(cl.VersionGame) + ":14:" + s(cl.Likes) +
        // 		":15:" + s(cl.Length) + ":17:" + s(isDemon) + ":18:" + s(cl.StarsGot) + ":19:" + s(cl.IsFeatured) + ":25:" + s(auto) + ":26:" + cl.StringLevelInfo +
        // 		":27:" + password + ":28:" + uplAge + ":29:" + updAge + ":30:" + s(cl.OrigId) + ":31:" + s(core.ToInt(cl.Is2p)) + ":35:" + s(cl.SongId) +
        // 		":36:" + cl.ExpandableStore.ExtraString + ":37:" + s(cl.Ucoins) + ":38:" + s(coinsVer) + ":39:" + s(cl.StarsRequested) + ":40:" + s(core.ToInt(cl.IsLDM)) +
        // 		":42:" + s(cl.IsEpic) + ":43:" + s(demonDiff) + ":45:" + s(cl.Objects) + ":46:1:47:2:48::52:" + sfxSongs[0] + ":53:" + sfxSongs[1] +
        // 		":57:" + s(cl.ExpandableStore.TS) + quest +
        // 		"#" + core.HashSolo(cl.StringLevel) + "#" + core.HashSolo2(hash) + questHash

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