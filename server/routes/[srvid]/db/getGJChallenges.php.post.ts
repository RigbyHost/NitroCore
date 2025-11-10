import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {z} from "zod";
import {QuestsController} from "~~/controller/QuestsController";
import {authMiddleware} from "~/gdps_middleware/user_auth";

export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success, error} = requestSchema.safeParse(post)
        if (!success) {
            useLogger().warn(JSON.stringify(z.treeifyError(error)))
            return await event.context.connector.error(-1, "Bad Request")
        }

        const questsController = new QuestsController(event.context.drizzle)
        const quests = await questsController.getQuests()
        if (quests.length > 0)
            return await event.context.connector.quests.getChallenges(
                quests,
                event.context.user!.$.uid,
                data.chk,
                data.udid
            )
        else
            return await event.context.connector.error(-2, "Quests not found")
    }
})

export const requestSchema = z.object({
    chk: z.string().transform(
        value => useGeometryDashTooling().doXOR(
            Buffer.from(value.slice(5), "base64").toString("utf-8"),
            "19847"
        )
    ),
    udid: z.string().optional().default(""),
})

