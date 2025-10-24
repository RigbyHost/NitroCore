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

        const csdk = useSDK().commands
        const role = await event.context.user!.fetchRole()

        // Decode base64
        const content = Buffer.from(data.comment, "base64").toString("utf-8")
        if ( role && content.length && content[0] === "!") {
            try {
                const cmds = content.slice(1).split(" ") // remove leading ! and split to args
                let data = await csdk.invoke(
                    "profile", cmds[0], cmds.slice(1),
                    {
                        drizzle: event.context.drizzle,
                        user: event.context.user!,
                        role: role
                    }
                )
                if (!data)
                    data = "Command executed!"
                return await event.context.connector.comments.commentCommandResult(data)
            } catch (e) {
                return await event.context.connector.comments.commentCommandResult((e as Error).message)
            }
        } else {
            await commentController.postAccountComment(event.context.user!.$.uid, data.comment)
            return await event.context.connector.success("Comment posted")
        }

    }
})

export const requestSchema = z.object({
    comment: z.string().min(1).transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
})