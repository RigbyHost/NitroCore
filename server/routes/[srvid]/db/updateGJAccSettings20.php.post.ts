import {authMiddleware} from "~/gdps_middleware/user_auth";
import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {z} from "zod";

export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await readFormData(event))
        const {data, success} = requestSchema.safeParse(post)
        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const user = event.context.user!
        user.$.settings = {
            ...user.$.settings,
            ...data
        }
        await user.commit()
        return await event.context.connector.success("Settings updated")
    }
})

export const requestSchema = z.object({
    mS: z.coerce.number().optional().default(0),
    frS: z.coerce.number().optional().default(0),
    cS: z.coerce.number().optional().default(0),
    yt: z.string().optional().default(""),
    twitter: z.string().optional().default(""),
    twitch: z.string().optional().default(""),
})