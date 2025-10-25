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

        const role = await event.context.user!.fetchRole()
        if (!role)
            return await event.context.connector.error(-1, "Unauthorized")

        const levelController = new LevelController(event.context.drizzle)
        const level = await levelController.getOneLevel(data.levelID)
        if (!level)
            return await event.context.connector.error(-1, "Level not found")

        data.stars = Math.min(data.stars, 10)

        if (role.privileges.aRateStars) {
            if (data.stars === 10 && !role.privileges.aRateDemon)
                return await event.context.connector.error(-1, "Unauthorized")

            level.rateLevel(data.stars)
            switch (data.feature) {
                case 1:
                    level.featureLevel(true)
                    break
                case 2:
                    level.epicLevel("epic")
                    break
                case 3:
                    level.epicLevel("legendary")
                    break
                case 4:
                    level.epicLevel("mythic")
                    break
                default:
                    level.featureLevel(false)
                    break
            }
            await level.commit()
            await new ActionController(event.context.drizzle)
                .registerAction("level_rate", event.context.user!.$.uid, level.$.id, {
                    uname: event.context.user!.$.username,
                    type: `Rate:${data.stars}`
                })
            if (data.feature > 0)
                await new ActionController(event.context.drizzle)
                    .registerAction("level_rate", event.context.user!.$.uid, level.$.id, {
                        uname: event.context.user!.$.username,
                        type: "Feature"
                    })
        } else if (role.privileges.aRateReq) {
            await level.requestRateByModerator(event.context.user!.$.uid, data.stars, data.feature>0)
        } else {
            return await event.context.connector.error(-1, "Unauthorized")
        }

        return await event.context.connector.success("Level rated")
    }
})

export const requestSchema = z.object({
    levelID: z.coerce.number(),
    feature: z.coerce.number(),
    stars: z.coerce.number().nonnegative(),
})