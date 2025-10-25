import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {z} from "zod";
import {CommentController} from "~~/controller/CommentController";


export default defineEventHandler({
    onRequest: [initMiddleware],

    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))

        const {data, success} = requestSchema.safeParse(post)

        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const mode = data.mode ? "likes": "postedTime"

        const commentController = new CommentController(event.context.drizzle)
        const comments = await commentController.getAllLevelComments(data.levelID, mode, data.page)

        return await event.context.connector.comments.getLevelComments(
            comments,
            await commentController.countLevelComments(data.levelID),
            data.page
        )
    }
})

export const requestSchema = z.object({
    levelID: z.coerce.number(), // May be Level List (negative)
    page: z.coerce.number().nonnegative().optional().default(0),
    mode: z.coerce.number().optional()
})