import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {CommentController} from "~~/controller/CommentController";
import {LevelController} from "~~/controller/LevelController";
import {ListController} from "~~/controller/ListController";

export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await readFormData(event))
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
            const role = await event.context.user!.fetchRole()
            // Decode base64
            const content = Buffer.from(data.comment, "base64").toString("utf-8")
            if (
                (role || level.isOwnedBy(event.context.user!.$.uid))
                && content.length && content[0] === "!"
            ) {
                // TODO: Comment commands
            } else {
                await commentController.postLevelComment(
                    event.context.user!.$.uid,
                    data.levelID,
                    content,
                    data.percent,
                )
            }
        } else {
            const listController = new ListController(event.context.drizzle)
            const list = await listController.getOneList(data.levelID)
            if (!list)
                return await event.context.connector.error(-1, "List not found")
            const role = await event.context.user!.fetchRole()
            // Decode base64
            const content = Buffer.from(data.comment, "base64").toString("utf-8")
            if (
                (role || list.isOwnedBy(event.context.user!.$.uid))
                && content.length && content[0] === "!"
            ) {
                // TODO: Comment commands
            } else {
                await commentController.postLevelComment(
                    event.context.user!.$.uid,
                    data.levelID,
                    content,
                    data.percent,
                )
            }
            await event.context.connector.error(-1, "Not implemented")
        }

        return await event.context.connector.success("Comment uploaded")
    }
})

export const requestSchema = z.object({
    commentID: z.coerce.number().positive(),
    levelID: z.coerce.number(),
    comment: z.string().nonempty().transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    percent: z.coerce.number().min(0).max(100).optional().default(0),
})