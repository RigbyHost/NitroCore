import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authLoginMiddleware} from "~/gdps_middleware/user_auth";

export default defineEventHandler({
    onRequest: [initMiddleware, authLoginMiddleware],

    handler: async (event) => {
        const user = event.context.user!

        const s3 = useStorage("savedata")
        const path = `/gdps_savedata/${event.context.config.config!.ServerConfig.SrvID}/${user.$.uid}.nsv`

        try {
            const data = await s3.getItem<string>(path)
            if (!data)
                return await event.context.connector.error(-1, "Savedata not found")
            return await event.context.connector.account.sync(data)
        } catch (e) {
            console.error(e)
            return await event.context.connector.error(-1, "Failed to sync account")
        }
    }
})