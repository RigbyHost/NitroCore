import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authLoginMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";

export default defineEventHandler({
    onRequest: [initMiddleware, authLoginMiddleware],

    handler: async (event) => {
        const user = event.context.user!

        const s3 = useStorage("savedata")
        const path = `/gdps_savedata/${event.context.config.config!.ServerConfig.SrvID}/${user.$.uid}.nsv`

        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success, error} = requestSchema.safeParse(post)
        if (!success) {
            useLogger().warn(JSON.stringify(z.treeifyError(error)))
            return await event.context.connector.error(-1, "Bad Request")
        }

        data.saveData = useGeometryDashTooling().clearGDRequest(data.saveData)
        data.saveData += `;${data.gameVersion};${data.binaryVersion}`

        try {
            await s3.setItem(path, data.saveData)

            const saveData = await useGzip().ungzip(
                Buffer.from(
                    data.saveData
                        .split(";")[0]
                        .replace("_", "/")
                        .replace("-", "+"),
                    "base64"
                )
            ).then(r => r.toString("utf-8"))

            user.$.orbs = Number(
                saveData.split("</s><k>14</k><s>")[1]
                    .split("</s>")[0]
            ) || 0
            /// strconv.Atoi(strings.Split(strings.Split(strings.Split(saveData, "<k>GS_value</k>")[1], "</s><k>4</k><s>")[1], "</s>")[0])
            user.$.levelsCompleted = Number(
                saveData.split("<k>GS_value</k>")[1]
                    .split("</s><k>4</k><s>")[1]
                    .split("</s>")[0]
            ) || 0

            await user.commit()
        } catch (e) {
            console.error(e)
            return await event.context.connector.error(-1, "Failed to backup account")
        }

        return await event.context.connector.success("Backup successful")
    }
})

export const requestSchema = z.object({
    gameVersion: z.string().nonempty().optional().default("21"),
    binaryVersion: z.string().nonempty().optional().default("30"),
    saveData: z.string().nonempty(),
})