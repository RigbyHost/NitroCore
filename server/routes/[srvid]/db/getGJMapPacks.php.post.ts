import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {LevelPackController} from "~~/controller/LevelPackController";
import {z} from "zod";

export default defineEventHandler({
    onRequest: [initMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await readFormData(event))
        const {data, success} = requestSchema.safeParse(post)
        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const levelPackController = new LevelPackController(event.context.drizzle)

        const {mappacks, total} = await levelPackController.getMappacks(data.page)

        return await event.context.connector.levels.getMapPacks(mappacks, total, data.page)
    }
})

const requestSchema = z.object({
    page: z.coerce.number().nonnegative().optional().default(0),
})