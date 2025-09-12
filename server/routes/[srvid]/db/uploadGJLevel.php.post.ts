import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {LevelController} from "~~/controller/LevelController";
import {Level} from "~~/controller/Level";
import {levelsTable} from "~~/drizzle";
import {ActionController} from "~~/controller/ActionController";

export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],

    handler: async (event) => {
        const form = await readFormData(event)
        const post = usePostObject<z.infer<typeof requestSchema>>(form)
        const {data, success} = requestSchema.safeParse(post)
        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const levelController = new LevelController(event.context.drizzle)
        const actionController = new ActionController(event.context.drizzle)

        const level = new Level(levelController, {
            ownerUid: event.context.user!.$.uid,
            versionGame: await useGeometryDashTooling().getGDVersionFromBody(form),
            versionBinary: data.binaryVersion,
            stringLevel: data.levelString,
            name: data.levelName,
            description: data.levelDesc,
            version: data.levelVersion,
            length: data.levelLength,
            trackId: data.audioTrack,
            songId: data.songID,
            password: data.password.toString(),
            originalId: data.original,
            objects: data.objects,
            userCoins: data.coins,
            starsRequested: data.requestedStars,
            is2player: data.twoPlayer>0,
            unlistedType: data.unlisted,
            isLDM: data.ldm>0,
            expandableStore: {
                extra_string: data.extraString,
                ts: data.ts,
            },
            stringLevelInfo: data.levelInfo,
            stringSettings: `${data.songIDs};${data.sfxIDs}`
        } as typeof levelsTable.$inferSelect)

        if (data.unlisted1)
            level.$.unlistedType = data.unlisted1
        level.$.unlistedType = level.$.unlistedType % 2 + data.unlisted2 % 2

        if (!level.validate())
            return await event.context.connector.error(-1, "Invalid level data")

        if (data.levelID) {
            // Update level
            const existingLevel = await levelController.getOneLevel(data.levelID)
            if (!existingLevel)
                return await event.context.connector.error(-1, "Level not found")
            if (!existingLevel.isOwnedBy(event.context.user!.$.uid))
                return await event.context.connector.error(-1, "You are not the owner of this level")
            level.$.id = data.levelID
            await level.commit()
            await actionController.registerAction(
                "level_update",
                event.context.user!.$.uid,
                level.$.id,
                {
                    name: level.$.name,
                    version: level.$.version.toString(),
                    objects: level.$.objects.toString(),
                    starsReq: level.$.starsRequested.toString(),
                }
            )
        } else {
            await level.create()
            await actionController.registerAction(
                "level_upload",
                event.context.user!.$.uid,
                level.$.id,
                {
                    name: level.$.name,
                    version: level.$.version.toString(),
                    objects: level.$.objects.toString(),
                    starsReq: level.$.starsRequested.toString(),
                }
            )
        }

        // TODO: Numbered success

    }
})

export const requestSchema = z.object({
    levelString: z.string().min(1).transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    levelName: z.string().optional().default("Unnamed").transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    levelDesc: z.string().optional().default("").transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    levelVersion: z.coerce.number().positive().optional().default(1),
    levelLength: z.coerce.number().optional().default(0),
    audioTrack: z.coerce.number().optional().default(0),
    songID: z.coerce.number().optional().default(0),
    password: z.coerce.number().optional().default(0),
    original: z.coerce.number().optional().default(0),
    objects: z.coerce.number().optional().default(0),
    coins: z.coerce.number().optional().default(0),
    requestedStars: z.coerce.number().optional().default(1),
    twoPlayer: z.coerce.number().optional().default(0),
    unlisted: z.coerce.number().optional().default(0),
    unlisted1: z.coerce.number().optional().default(0),
    unlisted2: z.coerce.number().optional().default(0),
    ldm: z.coerce.number().optional().default(0),
    extraString: z.string().optional().default("29_29_29_40_29_29_29_29_29_29_29_29_29_29_29_29").transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    ts: z.coerce.number().optional().default(0),
    levelInfo: z.string().optional().default("").transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    binaryVersion: z.coerce.number().optional().default(0),
    levelID: z.coerce.number().optional(),
    songIDs: z.coerce.string().optional().default("").transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    sfxIDs: z.coerce.string().optional().default("").transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
})