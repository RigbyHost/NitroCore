import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";


export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],

    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await readFormData(event))
        const {data, success} = requestSchema.safeParse(post)
        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const user = event.context.user!
        user.blacklist.remove(data.targetAccountID)
        await user.commit()

        return await event.context.connector.success("User unblocked")
    }
})

const requestSchema = z.object({
    targetAccountID: z.coerce.number().positive()
})