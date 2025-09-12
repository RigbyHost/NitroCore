import {authMiddleware} from "~/gdps_middleware/user_auth";
import {initMiddleware} from "~/gdps_middleware/init_gdps";
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

        level.reportLevel()
        await level.commit()

        return await event.context.connector.success("Level reported successfully")
    }
})

export const requestSchema = z.object({
    levelID: z.coerce.number().positive(),
})