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
import {authLoginMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {defineEventHandler, type H3Event} from 'nitro/h3';;

export default defineEventHandler(async (event) => {
    // Apply middleware
    await initMiddleware(event);
    await authLoginMiddleware(event);
    
    const user = event.context.user!

    const s3 = useStorage("savedata")
        const path = `/gdps_savedata/${event.context.config.config!.ServerConfig?.SrvID}/${user.$.uid}.nsv`

        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success, error} = requestSchema.safeParse(post)
        if (!success) {
            useLogger().warn(JSON.stringify(z.treeifyError(error)))
            return await event.context.connector.error(event, -1, "Bad Request")
        }

        data.saveData = useGeometryDashTooling().clearGDRequest(data?.saveData)
        data.saveData += `;${data?.gameVersion};${data?.binaryVersion}`

        try {
            await s3.setItem(path, data?.saveData)

            const saveData = await useGzip().ungzip(
                Buffer.from(
                    data?.saveData
                        ?.split(";")?.[0]
                        ?.replace("_", "/")
                        ?.replace("-", "+") || "",
                    "base64"
                )
            ).then(r => r.toString("utf-8"))

            user.$.orbs = Number(
                saveData.split("</s><k>14</k><s>")?.[1]
                    ?.split("</s>")?.[0]
            ) || 0
            /// strconv.Atoi(strings.Split(strings.Split(strings.Split(saveData, "<k>GS_value</k>")[1], "</s><k>4</k><s>")[1], "</s>")[0])
            user.$.levelsCompleted = Number(
                saveData.split("<k>GS_value</k>")?.[1]
                    ?.split("</s><k>4</k><s>")?.[1]
                    ?.split("</s>")?.[0]
            ) || 0

            await user.commit()
        } catch (e) {
            console.error(e)
            return await event.context.connector.error(event, -1, "Failed to backup account")
        }

        return await event.context.connector.success(event, "Backup successful")
    }
)

export const requestSchema = z.object({
    gameVersion: z.string().nonempty().optional().default("21"),
    binaryVersion: z.string().nonempty().optional().default("30"),
    saveData: z.string().nonempty(),
})