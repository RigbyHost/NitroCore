import {levelpacksTable, songsTable} from "~~/drizzle";
import {Level, LevelWithUser} from "~~/controller/Level";
import {List, ListWithUser} from "~~/controller/List";


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
        level: Level<LevelWithUser>,
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
    },

    getSearchedLevels: async (
        levels: Array<Level<LevelWithUser>>,
        songs: typeof songsTable.$inferSelect[],
        count: number,
        page: number,
        gauntlet: boolean
    ) => {
        const levelsOutput: Array<string> = []
        const levelHashMeta: Array<string> = []
        const userMeta: Array<string> = []
        const songMeta = songs.map(
            song => [
                1, song.id,
                2, song.name,
                3, 1,
                4, song.artist,
                5, song.size.toFixed(2),
                6, "",
                10, encodeURI(song.url)
            ].join("~|~").replaceAll("#", "")
        ).join("~:~")

        levels.forEach(level => {
            const levelArr = [
                1, level.$.id,
                2, level.$.name,
                3, level.$.description,
                5, level.$.version,
                6, level.$.ownerUid,
                8, level.$.difficulty > 0 ? 10 : 0,
                9, level.$.difficulty < 0 ? 0 : level.$.difficulty,
                10, level.$.downloads,
                12, level.$.trackId,
                13, level.$.versionGame,
                14, level.$.likes,
                15, level.$.length,
                17, level.$.demonDifficulty >= 0 ? 1 : 0,
                18, level.$.starsGot,
                19, level.$.isFeatured ? 1 : 0,
                25, level.$.difficulty < 0 ? 1 : 0,
                30, level.$.originalId,
                31, level.$.is2player ? 1 : 0,
                35, level.$.songId,
                37, level.$.userCoins,
                38, level.$.coins > 0 ? 1 : 0,
                39, level.$.starsRequested,
                42, level.$.epicness,
                43, level.$.demonDifficulty >= 0 ? level.$.demonDifficulty : 3,
                45, level.$.objects,
                46, 1,
                47, 2
            ]
            if (gauntlet)
                levelArr.push(44, 1)
            levelsOutput.push(levelArr.join(":"))
            levelHashMeta.push(
                level.$.id.toString()[0] +
                level.$.id.toString()[level.$.id.toString().length - 1] +
                level.$.starsGot +
                (level.$.coins > 0 ? 1 : 0)
            )
            userMeta.push(
                level.$.ownerUid + ":" +
                level.$.author?.username || "[DELTED]" + ":" +
                level.$.ownerUid
            )
        })

        await send(
            useEvent(),
            `${levelsOutput.join("|")}#` +
            `${userMeta.join("|")}#` +
            `${songMeta}#` +
            `${count}:${page * 10}:10#${useGeometryDashTooling().hashSolo2(levelHashMeta.join(""))}`
        )
    },

    getSearchedLists: async (
        lists: Array<List<ListWithUser>>,
        count: number,
        page: number,
    ) => {
        const listOutput: Array<string> = []
        const userMeta: Array<string> = []

        lists.forEach(list => {
            listOutput.push(
                [
                    1, list.$.id,
                    2, list.$.name,
                    3, list.$.description,
                    5, list.$.version,
                    7, list.$.difficulty,
                    10, list.$.downloads,
                    14, list.$.likes,
                    19, list.$.isFeatured ? 1 : 0,
                    28, useGeometryDashTooling().getDateAgo(list.$.uploadDate.getTime()),
                    29, useGeometryDashTooling().getDateAgo(list.$.updateDate.getTime()),
                    49, list.$.ownerId,
                    50, list.$.author?.username || "[DELETED]",
                    51, list.$.levels,
                    55, list.$.diamonds,
                    56, list.$.levelDiamonds
                ].join(":")
            )

            userMeta.push(
                list.$.ownerId + ":" +
                list.$.author?.username || "[DELETED]" + ":" +
                list.$.ownerId
            )
        })

        await send(
            useEvent(),
            `${listOutput.join("|")}#` +
            `${userMeta.join("|")}#` +
            `${count}:${page * 10}:10#${useGeometryDashTooling().hashSolo2("All hackers gain epic")}`
        )

    }
}