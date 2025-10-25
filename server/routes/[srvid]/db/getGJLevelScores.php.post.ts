import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {ScoresController} from "~~/controller/ScoresController";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {scoresTable} from "~~/drizzle";

export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success, error} = requestSchema.safeParse(post)

        if (!success) {
            useLogger().warn(JSON.stringify(z.treeifyError(error)))
            return await event.context.connector.error(-1, "Bad Request")
        }

        const scoresController = new ScoresController(event.context.drizzle)

        if (data.percent > 0) {
            // TODO: Anticheat model
            const score: typeof scoresTable.$inferInsert = {
                uid: event.context.user!.$.uid,
                levelId: data.levelID,
                percent: data.percent,
                attempts: data.s1,
                coins: data.s9,
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
            "regular",
            event.context.user!.$.uid
        )

        if (scores.length === 0)
            return await event.context.connector.error(-2, "No scores found")

        return await event.context.connector.scores.getScoresForLevel(scores, "default")
    }
})

export const requestSchema = z.object({
    levelID: z.coerce.number(),
    mode: z.coerce.number().min(0).max(2).optional().default(0),
    percent: z.coerce.number().nonnegative().max(100).optional().default(0),
    s1: z.coerce.number().min(8354).optional().default(8354).transform(
        value => value - 8354
    ), //attempts
    s2: z.coerce.number().min(3991).optional().default(3991).transform(
        value => value - 3991
    ), //clicks
    s3: z.coerce.number().min(4085).optional().default(4085).transform(
        value => value - 4085
    ), // seconds spent on level
    s4: z.coerce.number().optional(), // seed
    s8: z.coerce.number().optional(), // Attempt count again
    s9: z.coerce.number().min(5819).max(5823).optional().default(5819).transform(
        value => value - 5819
    ), //coins
})

const generateLeaderboardSeed = (
    clicks: number,
    percentage: number,
    seconds: number,
    hasPlayed: boolean = true): number => {
    return (
        1482 * (hasPlayed?2:1)
        + (clicks + 3991) * (percentage + 8354)
        + ((seconds + 4085) ** 2) - 50028039
    )
}