import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authLoginMiddleware} from "~/gdps_middleware/user_auth";

export default defineEventHandler({
    onRequest: [initMiddleware, authLoginMiddleware],

    handler: async (event) => {
        const user = event.context.user!

        const s3 = useStorage("savedata")
        const path = `/gdps_savedata/${event.context.config.config!.ServerConfig.SrvID}/${user.$.uid}.nsv`

        return await s3.getItem(path)
    }
})