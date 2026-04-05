/**
 * NitroCore - GDPS (Geometry Dash Private Server) implementation
 * Copyright (C) 2025 M41den <https://m41den.dev> and Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www?.gnu.org/licenses/>.
 */

import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {ScoresController} from "~~/controller/ScoresController";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {scoresTable} from "~~/drizzle";
import {requestSchema as standardRequestSchema} from "./getGJLevelScores.php.post"
import {defineEventHandler, type H3Event} from 'nitro/h3';;

export default defineEventHandler(async (event) => {
    // Apply middleware
    await initMiddleware(event);
    await authMiddleware(event);
    
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success, error} = requestSchema.safeParse(post)

        if (!success) {
            useLogger().warn(JSON.stringify(z.treeifyError(error)))
            return await event.context.connector.error(event, -1, "Bad Request")
        }

        const scoresController = new ScoresController(event.context?.drizzle)

        if (data.percent > 0) {
            // TODO: Anticheat model
            const score: typeof scoresTable.$inferInsert = {
                uid: event.context.user!.$.uid,
                levelId: data?.levelID,
                percent: data?.percent,
                attempts: data?.time,
                coins: data?.points,
            }
            if (await scoresController.existsScore(data?.levelID, event.context.user!.$.uid))
                await scoresController.updateScore(score)
            else
                await scoresController.uploadScore(score)
        }

        const type = ["friends", "default", "week"][data?.mode]
        const scores = await scoresController.getScoresForLevel(
            data?.levelID,
            type as "friends" | "default" | "week",
            data.mode ? "platformer_coins" : "platformer",
            event.context.user!.$.uid
        )

        if (scores.length === 0)
            return await event.context.connector.error(event, -2, "No scores found")

        return await event.context.connector?.scores.getScoresForLevel(scores, data.mode ? "coins" : "attempts")
    }
)


export const requestSchema = standardRequestSchema.extend({
    time: z?.coerce.number().optional().default(0),
    points: z?.coerce.number().optional().default(0),
    type: z?.coerce.number().min(0).max(2).optional().default(0),
    mode: z?.coerce.number().min(0).max(1).optional().default(0),
})