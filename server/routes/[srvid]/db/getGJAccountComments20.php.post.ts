import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {CommentController} from "~~/controller/CommentController";


export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],

    handler: async (event) => {
        const post = await withPreparsedForm(event)

        const {data, success, error} = requestSchema.safeParse({
            commentID: post.getAll("commentID"),
            page: post.get("page")
        })

        if (!success) {
            useLogger().warn(JSON.stringify(z.treeifyError(error)))
            return await event.context.connector.error(-1, "Bad Request")
        }

        const uid = data.commentID.slice(-1)[0]

        const commentController = new CommentController(event.context.drizzle)

        const comments = await commentController.getAllAccountComments(uid, data.page)
        const count = await commentController.countUserComments(uid)

        return await event.context.connector.comments.getAccountComments(comments, count, data.page)
    }
})

export const requestSchema = z.object({
    commentID: z.array(z.coerce.number().positive()).min(1).max(2),
    page: z.coerce.number().nonnegative().optional().default(0)
})