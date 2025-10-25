import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {LevelController} from "~~/controller/LevelController";
import {ActionController} from "~~/controller/ActionController";

export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],

    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success} = requestSchema.safeParse(post)

        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const levelController = new LevelController(event.context.drizzle)
        const level = await levelController.getOneLevel(data.levelID)
        if (!level)
            return await event.context.connector.error(-1, "Level not found")
        if (!level.isOwnedBy(event.context.user!.$.uid))
            return await event.context.connector.error(-1, "You are not the owner of this level")

        await level.delete()
        await levelController.recalculateCreatorPoints(event.context.user!.$.uid)

        const actionController = new ActionController(event.context.drizzle)
        await actionController.registerAction(
            "level_delete",
            event.context.user!.$.uid,
            level.$.id,
            {
                uname: event.context.user!.$.username,
                type: "Delete:Owner"
            }
        )
        return await event.context.connector.success("Level deleted successfully")
    }
})

export const requestSchema = z.object({
    levelID: z.coerce.number().positive()
})