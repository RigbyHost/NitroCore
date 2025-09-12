import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {CommentController} from "~~/controller/CommentController";


export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],

    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await readFormData(event))

        const {data, success} = requestSchema.safeParse(post)

        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const commentController = new CommentController(event.context.drizzle)

        await commentController.postAccountComment(event.context.user!.$.uid, data.comment)
        return await event.context.connector.success("Comment posted")
    }
})

export const requestSchema = z.object({
    comment: z.string().min(1).transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
})