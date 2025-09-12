import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {LevelController} from "~~/controller/LevelController";

export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],

    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await readFormData(event))
        const {data, success} = requestSchema.safeParse(post)
        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const levelController = new LevelController(event.context.drizzle)
        const level = await levelController.getOneLevel(data.levelID)
        if (!level)
            return await event.context.connector.error(-1, "Level not found")
        if (!level.isOwnedBy(event.context.user!.$.uid))
            return await event.context.connector.error(-1, "You are not the owner of this level")

        level.$.description = data.levelDesc
        if (!level.validate())
            return await event.context.connector.error(-1, "Invalid level description")

        await level.commit()

        return await event.context.connector.success("Level description updated successfully")
    }
})

export const requestSchema = z.object({
    levelID: z.coerce.number().positive(),
    levelDesc: z.string().transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
})