import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {z} from "zod";
import {MusicController} from "~~/controller/MusicController";

export default defineEventHandler({
    onRequest: [initMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await readFormData(event))
        const {data, success} = requestSchema.safeParse(post)

        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const musicController = new MusicController(event.context.drizzle)
        const {artists, total} = await musicController.getTopArtists(data.page)

        return await event.context.connector.getTopArtists(artists, data.page, total)
    }
})

export const requestSchema = z.object({
    page: z.coerce.number().nonnegative().optional().default(0)
})