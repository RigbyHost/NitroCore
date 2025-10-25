import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";

export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success} = requestSchema.safeParse(post)
        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const {config} = event.context.config

        let smallChestsLeft = Math.max(0, config!.ChestConfig.ChestSmallWait - 100 + event.context.user!.$.chests.small_time - Date.now())
        let bigChestsLeft = Math.max(0, config!.ChestConfig.ChestSmallWait - 100 + event.context.user!.$.chests.big_time - Date.now())

        switch (data.rewardType) {
            case 1:
                if (smallChestsLeft > 0)
                    return await event.context.connector.error(-2, "Small chests not ready")
                event.context.user!.$.chests.small_count++
                event.context.user!.$.chests.small_time = Date.now()
                await event.context.user!.commit()
                smallChestsLeft = config!.ChestConfig.ChestSmallWait
                break
            case 2:
                if (bigChestsLeft > 0)
                    return await event.context.connector.error(-2, "Big chests not ready")
                event.context.user!.$.chests.big_count++
                event.context.user!.$.chests.big_time = Date.now()
                await event.context.user!.commit()
                bigChestsLeft = config!.ChestConfig.ChestBigWait
                break
        }

        return await event.context.connector.quests.getRewards(
            event.context.user!,
            data.udid,
            data.chk,
            smallChestsLeft,
            bigChestsLeft,
            data.rewardType
        )
    }
})

export const requestSchema = z.object({
    chk: z.string().transform(
        value => useGeometryDashTooling().doXOR(
            Buffer.from(value.slice(5), "base64").toString("utf-8"),
            "59182"
        )
    ),
    udid: z.string().optional().default(""),
    rewardType: z.coerce.number().min(1).max(2).optional().default(0),
})
