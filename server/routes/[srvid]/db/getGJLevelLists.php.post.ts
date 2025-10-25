import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {z} from "zod";
import {ListController} from "~~/controller/ListController";
import {List, ListWithUser} from "~~/controller/List";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {FriendshipController} from "~~/controller/FriendshipController";

const metrics = usePerformance()

export default defineEventHandler({
    onRequest: [initMiddleware],
    onBeforeResponse: [
        () => console.warn(metrics.getSteps())
    ],
    handler: async (event) => {
        metrics.reset()
        metrics.step("Read & parse body")
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success, error} = requestSchema.safeParse(post)

        if (!success) {
            useLogger().warn(JSON.stringify(z.treeifyError(error)))
            return await event.context.connector.error(-1, "Bad Request")
        }

        const listController = new ListController(event.context.drizzle)
        const filter = listController.getFilter()

        metrics.step("Search lists")

        let result: {
            lists: Array<List<ListWithUser>>,
            total: number
        } = {lists: [], total: 0}

        switch (data.type) {
            case 1:
                result = await filter.searchLists("mostdownloaded", data)
                break
            case 3:
                result = await filter.searchLists("trending", data)
                break
            case 4:
            case 7:
                result = await filter.searchLists("latest", data)
                break
            case 5:
                result = await filter.searchUserLists(data, false)
                break
            case 11:
                result = await filter.searchLists("awarded", data)
                break
            case 12:
                result = await filter.searchUserLists(data, true)
                break
            case 13:
                await authMiddleware(event)
                if (!event.context.user)
                    return await event.context.connector.error(-1, "Not logged in")
                const friendshipController = new FriendshipController(event.context.drizzle)
                const friends = await friendshipController.getAccountFriendsIds(0, event.context.user)
                data.followed = friends
                result = await filter.searchUserLists(data, true)
                break
            case 27:
                result = await filter.searchLists("sent", data)
                break
            default:
                result = await filter.searchLists("mostliked", data)
        }

        metrics.step("Send response")
        return await event.context.connector.levels.getSearchedLists(result.lists, result.total, data.page)
    }
})


export const requestSchema = z.object({
    type: z.coerce.number().optional().default(0),
    page: z.coerce.number().nonnegative().optional().default(0),
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
    star: z.coerce.number().optional(),
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