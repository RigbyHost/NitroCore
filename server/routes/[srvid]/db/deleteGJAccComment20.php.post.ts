import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {CommentController} from "~~/controller/CommentController";


export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],

    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))

        const {data, success, error} = requestSchema.safeParse(post)

        if (!success) {
            useLogger().warn(JSON.stringify(z.treeifyError(error)))
            return await event.context.connector.error(-1, "Bad Request")
        }

        const commentController = new CommentController(event.context.drizzle)

        await commentController.deleteAccountComment(data.commentID, event.context.user!.$.uid)

        return await event.context.connector.success("Comment deleted")
    }
})

export const requestSchema = z.object({
    commentID: z.coerce.number().positive()
})