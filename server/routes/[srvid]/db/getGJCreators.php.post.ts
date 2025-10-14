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
        if (!users.length)
            return await event.context.connector.error(-2, "No users in leaderboard")
        return await event.context.connector.scores.getLeaderboard(users)
    }
})
