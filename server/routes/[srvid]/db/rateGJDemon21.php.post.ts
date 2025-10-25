import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {LevelController} from "~~/controller/LevelController";

export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success, error} = requestSchema.safeParse(post)
        if (!success) {
            useLogger().warn(JSON.stringify(z.treeifyError(error)))
            return await event.context.connector.error(-1, "Bad Request")
        }

        const role = await event.context.user!.fetchRole()
        if (!role?.privileges.aRateDemon)
            return await event.context.connector.error(-1, "Unauthorized")

        const levelController = new LevelController(event.context.drizzle)
        const level = await levelController.getOneLevel(data.levelID)
        if (!level)
            return await event.context.connector.error(-1, "Level not found")

        level.rateDemon(data.rating)
        await level.commit()

        return await event.context.connector.numberedSuccess(level.$.id, "Level rated")
    }
})

export const requestSchema = z.object({
    levelID: z.coerce.number(),
    mode: z.coerce.number().positive(),
    rating: z.coerce.number().nonnegative(),
})