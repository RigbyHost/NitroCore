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
            return "-1"

        const commentController = new CommentController(event.context.drizzle)

        await commentController.deleteAccountComment(data.commentID, event.context.user!.$.uid)

        return "1"
    }
})

const requestSchema = z.object({
    commentID: z.number().gt(0)
})