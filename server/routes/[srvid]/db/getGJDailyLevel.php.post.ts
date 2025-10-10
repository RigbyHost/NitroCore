import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {z} from "zod";
import {QuestsController} from "~~/controller/QuestsController";

export default defineEventHandler({
    onRequest: [initMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await readFormData(event))

        const {data, success} = requestSchema.safeParse(post)

        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        let variant = "daily"
        if (data.weekly === 1)
            variant = "weekly"

        if (data.type) {
            variant = "daily"
            if (data.type === 1)
                variant = "weekly"
            if (data.type === 2)
                variant = "event"
        }

        const questController = new QuestsController(event.context.drizzle)
        const quest = await questController.getOneQuest({
            type: variant as "weekly" | "daily" | "event"
        })
        if (!quest)
            return await event.context.connector.error(-2, "Quest not found")
        // TODO: Add connector
    }
})

export const requestSchema = z.object({
    weekly: z.coerce.number().optional().default(0),
    type: z.coerce.number().optional()
})