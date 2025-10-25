import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {z} from "zod";
import {UserController} from "~~/controller/UserController";

export default defineEventHandler({
    onRequest: [initMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success} = requestSchema.safeParse(post)

        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const userController = new UserController(event.context.drizzle)
        const users = await userController.searchUsers(data.str, data.page)

        if (!users.length)
            return await event.context.connector.error(-1, "User not found")

        return await event.context.connector.profile.getUserSearch(users, data.page, users.length)
    }
})

export const requestSchema = z.object({
    str: z.string().nonempty().transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    page: z.coerce.number().nonnegative().optional().default(0),
})