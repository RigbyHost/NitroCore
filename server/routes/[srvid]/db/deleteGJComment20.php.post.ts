import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {LevelController} from "~~/controller/LevelController";
import {CommentController} from "~~/controller/CommentController";
import {ListController} from "~~/controller/ListController";

export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success} = requestSchema.safeParse(post)
        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const commentController = new CommentController(event.context.drizzle)

        if (data.levelID > 0) {
            // Level
            const levelController = new LevelController(event.context.drizzle)
            const level = await levelController.getOneLevel(data.levelID)
            if (!level)
                return await event.context.connector.error(-1, "Level not found")
            if (level.isOwnedBy(event.context.user!.$.uid))
                await commentController.deleteLevelCommentByOwner(data.commentID, data.levelID)
            else
                await commentController.deleteLevelComment(data.commentID, event.context.user!.$.uid)
        } else {
            const listController = new ListController(event.context.drizzle)
            const list = await listController.getOneList(data.levelID)
            if (!list)
                return await event.context.connector.error(-1, "List not found")
            if (list.isOwnedBy(event.context.user!.$.uid))
                await commentController.deleteLevelCommentByOwner(data.commentID, data.levelID)
            else
                await commentController.deleteLevelComment(data.commentID, event.context.user!.$.uid)
        }

        return await event.context.connector.success("Comment deleted")
    }
})

export const requestSchema = z.object({
    commentID: z.coerce.number().positive(),
    levelID: z.coerce.number()
})