import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {z} from "zod";
import {CommentController} from "~~/controller/CommentController";
import {UserController} from "~~/controller/UserController";


export default defineEventHandler({
    onRequest: [initMiddleware],

    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await readFormData(event))
        const {data, success} = requestSchema.safeParse(post)
        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const mode = data.mode ? "likes": "postedTime"

        const userController = new UserController(event.context.drizzle)
        const commentController = new CommentController(event.context.drizzle)

        const targetUser = await userController.getOneUser({uid: data.userID}, true)
        if (!targetUser)
            return await event.context.connector.error(-1, "User not found")

        const comments = await commentController.getCommentHistory(
            data.userID,
            mode,
            data.page
        )

        return await event.context.connector.comments.getCommentHistory(
            comments,
            targetUser.$,
            targetUser.$.role,
            await commentController.countCommentHistory(data.userID),
            data.page
        )
    }
})

export const requestSchema = z.object({
    userID: z.coerce.number().positive(),
    page: z.coerce.number().nonnegative().optional().default(0),
    mode: z.coerce.number().optional().default(0),
})