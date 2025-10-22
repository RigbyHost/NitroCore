import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {z} from "zod";
import {LevelController} from "~~/controller/LevelController";
import {FriendshipController} from "~~/controller/FriendshipController";
import {authLoginMiddleware} from "~/gdps_middleware/user_auth";
import {ListController} from "~~/controller/ListController";
import {MusicController} from "~~/controller/MusicController";

const metrics = usePerformance()

export default defineEventHandler({
    onRequest: [initMiddleware],
    onBeforeResponse: [
        () => console.warn(metrics.getSteps())
    ],

    handler: async (event) => {
        metrics.reset()
        metrics.step("Read & parse body")
        const form = await readFormData(event)
        const post = usePostObject<z.infer<typeof requestSchema>>(form)
        const {data, success} = requestSchema.safeParse(post)
        if (!success)
            return await event.context.connector.error(-1, "Bad Request")


        const levelController = new LevelController(event.context.drizzle)
        const filter = levelController.getFilter()

        metrics.step("Search levels")

        let result: {
            levels: number[],
            total: number
        } = {levels: [], total: 0}
        switch (data.type) {
            case 1:
                result = await filter.searchLevels("mostdownloaded", data)
                break
            case 3:
                result = await filter.searchLevels("trending", data)
                break
            case 4:
                result = await filter.searchLevels("latest", data)
                break
            case 5:
                result = await filter.searchUserLevels(data, false)
                break
            case 6:
            case 17:
                data.featured = 1
                result = await filter.searchLevels("latest", data)
                break
            case 7:
                result = await filter.searchLevels("magic", data)
                break
            case 10:
            case 19:
                result = await filter.searchListLevels(data)
                break
            case 11:
                data.star = 1
                result = await filter.searchLevels("latest", data) // Awarded
                break
            case 12:
                result = await filter.searchUserLevels(data, true) // Followed
                break
            case 13:
                // Friend levels
                await authLoginMiddleware(event)
                if (!event.context.user)
                    return await event.context.connector.error(-1, "Not logged in")
                const friendshipController = new FriendshipController(event.context.drizzle)
                const friends = await friendshipController.getAccountFriendsIds(0, event.context.user)
                data.followed = friends
                result = await filter.searchUserLevels(data, true)
                break
            case 16:
                result = await filter.searchLevels("hall", data)
                break
            case 21:
                result = await filter.searchLevels("safe_daily", data)
                break
            case 22:
                result = await filter.searchLevels("safe_weekly", data)
                break
            case 23:
                result = await filter.searchLevels("safe_event", data)
                break
            case 25:
                const listController = new ListController(event.context.drizzle)
                const id = Number(data.str)
                if (isNaN(id))
                    break
                const list = await listController.getOneList(id)
                if (!list)
                    break
                await list.onDownload()
                result = {
                    levels: list.$.levels || [],
                    total: list.$.levels?.length || 0
                }
                break
            case 27:
                result = await filter.searchLevels("sent", data)
                break
            default:
                result = await filter.searchLevels("mostliked", data)
        }

        if (result.levels.length === 0)
            return await event.context.connector.error(-2, "No levels found")

        metrics.step("Get levels data")

        const levels = await levelController.getManyLevels(result.levels, true)

        const musicController = new MusicController(event.context.drizzle)
        const music = await musicController.getSongBulk(
            levels
                .filter(level => level.$.songId>0)
                .map(level => level.$.songId)
        )

        return await event.context.connector.levels.getSearchedLevels(
            levels, music, result.total, data.page, post.gauntlet>0
        )

    }
})

export const requestSchema = z.object({
    type: z.coerce.number().optional().default(0),
    page: z.coerce.number().nonnegative().optional().default(0),
    versionGame: z.coerce.number().optional().default(1),
    str: z.string().optional().default("").transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    diff: z.string().nonempty()
        .regex(/^(\d(?:,\d)*|-)$/) // x,y,z... or - (empty)
        .optional().default("")
        .transform(
            value => value==="-" ? "" : value
        ).transform(
            value => value.split(",")
                .filter(v=>v.trim()) // Cleans empty values
                .map(v=>parseInt(v))
        ),
    demonFilter: z.coerce.number().nonnegative().optional(),
    len: z.string().nonempty()
        .regex(/^(\d(?:,\d)*|-)$/) // x,y,z... or - (empty)
        .optional().default("")
        .transform(
            value => value==="-" ? "" : value
        ).transform(
            value => value.split(",")
                .filter(v=>v.trim()) // Cleans empty values
                .map(v=>parseInt(v))
        ),
    uncompleted: z.coerce.number().optional().default(0),
    onlyCompleted: z.coerce.number().optional().default(0),
    completedLevels: z.string().nonempty()
        .regex(/^(\d(?:,\d)*|-)$/) // x,y,z... or - (empty)
        .optional().default("")
        .transform(
            value => value==="-" ? "" : value
        ).transform(
            value => value.split(",")
                .filter(v=>v.trim()) // Cleans empty values
                .map(v=>parseInt(v))
        ),
    featured: z.coerce.number().optional().default(0),
    epic: z.coerce.number().optional().default(0),
    mythic: z.coerce.number().optional().default(0),
    legendary: z.coerce.number().optional().default(0),
    original: z.coerce.number().optional().default(0),
    twoPlayer: z.coerce.number().optional().default(0),
    coins: z.coerce.number().optional().default(0),
    star: z.coerce.number().optional().default(0),
    noStar: z.coerce.number().optional().default(0),
    song: z.coerce.number().optional(),
    songCustom: z.coerce.number().optional(),
    gauntlet: z.coerce.number().optional().default(0),
    followed: z.string().nonempty()
        .regex(/^(\d(?:,\d)*|-)$/) // x,y,z... or - (empty)
        .optional().default("")
        .transform(
            value => value==="-" ? "" : value
        ).transform(
            value => value.split(",")
                .filter(v=>v.trim()) // Cleans empty values
                .map(v=>parseInt(v))
        ),
})