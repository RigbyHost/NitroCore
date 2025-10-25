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

        switch (data.type) {
            case 1:
            {
                const levelController = new LevelController(event.context.drizzle)
                const level = await levelController.getOneLevel(data.itemID)
                if (!level)
                    return await event.context.connector.error(-1, "Level not found")
                await level.likeLevel(event.context.user!.$.uid, data.like ? "like": "dislike")
                return await event.context.connector.success("Level liked")
            }
            case 2:
            {
                const commentController = new CommentController(event.context.drizzle)
                const comment = await commentController.getOneLevelComment(data.itemID)
                if (!comment)
                    return await event.context.connector.error(-1, "Comment not found")
                await commentController.likeLevelComment(comment.id, event.context.user!.$.uid, data.like ? "like": "dislike")
                return await event.context.connector.success("Comment liked")
            }
            case 3:
            {
                const commentController = new CommentController(event.context.drizzle)
                const comment = await commentController.getOneAccountComment(data.itemID)
                if (!comment)
                    return await event.context.connector.error(-1, "Comment not found")
                await commentController.likeAccountComment(comment.id, event.context.user!.$.uid, data.like ? "like": "dislike")
                return await event.context.connector.success("Comment liked")
            }
            case 4:
            {
                const listController = new ListController(event.context.drizzle)
                const list = await listController.getOneList(data.itemID)
                if (!list)
                    return await event.context.connector.error(-1, "List not found")
                await list.likeList(event.context.user!.$.uid, data.like ? "like": "dislike")
                return await event.context.connector.success("List liked")
            }
        }
    }
})

export const requestSchema = z.object({
    itemID: z.coerce.number(),
    type: z.coerce.number().min(1).max(4),
    like: z.coerce.number().transform(
        value => value === 1
    )
})