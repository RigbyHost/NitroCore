import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {ScoresController} from "~~/controller/ScoresController";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {scoresTable} from "~~/drizzle";
import {requestSchema as standardRequestSchema} from "./getGJLevelScores.php.post"

export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success} = requestSchema.safeParse(post)

        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const scoresController = new ScoresController(event.context.drizzle)

        if (data.percent > 0) {
            // TODO: Anticheat model
            const score: typeof scoresTable.$inferInsert = {
                uid: event.context.user!.$.uid,
                levelId: data.levelID,
                percent: data.percent,
                attempts: data.time,
                coins: data.points,
            }
            if (await scoresController.existsScore(data.levelID, event.context.user!.$.uid))
                await scoresController.updateScore(score)
            else
                await scoresController.uploadScore(score)
        }

        const type = ["friends", "default", "week"][data.mode]
        const scores = await scoresController.getScoresForLevel(
            data.levelID,
            type as "friends" | "default" | "week",
            data.mode ? "platformer_coins" : "platformer",
            event.context.user!.$.uid
        )

        if (scores.length === 0)
            return await event.context.connector.error(-2, "No scores found")

        return await event.context.connector.scores.getScoresForLevel(scores, data.mode ? "coins" : "attempts")
    }
})

export const requestSchema = standardRequestSchema.extend({
    time: z.coerce.number().optional().default(0),
    points: z.coerce.number().optional().default(0),
    type: z.coerce.number().min(0).max(2).optional().default(0),
    mode: z.coerce.number().min(0).max(1).optional().default(0),
})