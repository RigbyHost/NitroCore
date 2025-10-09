import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {z} from "zod";
import {LevelController} from "~~/controller/LevelController";
import {UserController} from "~~/controller/UserController";
import {QuestsController} from "~~/controller/QuestsController";

export default defineEventHandler({
    onRequest: [initMiddleware],

    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await readFormData(event))
        const {data, success} = requestSchema.safeParse(post)
        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const levelController = new LevelController(event.context.drizzle)

        let questID = 0
        if (data.levelID < 0) {
            const questsController = new QuestsController(event.context.drizzle)
            const quest = await questsController.getOneQuest({
                numericType: data.levelID
            })
            if (!quest)
                return await event.context.connector.error(-2, "Quest not found")
            questID = quest.id
            data.levelID = quest.levelId
        }

        const level = await levelController.getOneLevel(data.levelID, true)
        if (!level)
            return await event.context.connector.error(-2, "Level not found")

        await level.onDownload()

        let password = "0"
        let hashablePassword = level.$.password
        if (hashablePassword != "0") {
            password = Buffer.from(
                useGeometryDashTooling().doXOR(hashablePassword, "26364"),
                "utf-8"
            ).toString("base64")
        }

        // Auth for no password
        const userController = new UserController(event.context.drizzle)
        const user = await userController.performGJPAuth()
        if (user) {
            const role = await user.fetchRole()
            if (role && role.privileges.cLvlAccess) {
                Buffer.from(
                    useGeometryDashTooling().doXOR("1", "26364"),
                    "utf-8"
                ).toString("base64")
            }
        }

        if (level.$.suggestedDifficultyCount > 0 && level.$.starsGot === 0) {
            let diffName = "Unspecified"
            const diff = Math.round(level.$.suggestedDifficulty)
            switch (diff) {
                case 1:
                    diffName = "Auto"
                    break
                case 2:
                    diffName = "Easy"
                    break
                case 3:
                    diffName = "Normal"
                    break
                case 4:
                case 5:
                    diffName = "Hard"
                    break
                case 6:
                case 7:
                    diffName = "Harder"
                    break
                case 8:
                case 9:
                    diffName = "Insane"
                    break
                case 10:
                    diffName = "Demon"
                    break
            }

            level.$.description = Buffer.from(
                Buffer.from(level.$.description, "base64").toString("utf-8") +
                ` \n[Suggested difficulty: ${diffName} [${level.$.suggestedDifficulty.toFixed(2)}] (${level.$.suggestedDifficultyCount} votes)`,
                "utf-8"
            ).toString("base64")
        }

        await event.context.connector.levels.getFullLevel(level, password, hashablePassword, questID)
    }
})

export const requestSchema = z.object({
    levelID: z.coerce.number(),
})