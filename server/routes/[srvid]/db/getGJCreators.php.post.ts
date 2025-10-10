import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {UserController} from "~~/controller/UserController";

export default defineEventHandler({
    onRequest: [initMiddleware],
    handler: async (event) => {
        const {config} = event.context.config
        const userController = new UserController(event.context.drizzle)
        const users = await userController.getLeaderboard({
            type: "cpoints",
            limit: config!.ServerConfig.TopSize
        })
        // TODO: implement connector
    }
})
