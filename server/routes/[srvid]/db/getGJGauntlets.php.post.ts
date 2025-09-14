import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {LevelPackController} from "~~/controller/LevelPackController";

export default defineEventHandler({
    onRequest: [initMiddleware],

    handler: async (event) => {
        const levelPackController = new LevelPackController(event.context.drizzle)

        const gauntlets = await levelPackController.getGauntlets()

        return await event.context.connector.levels.getGauntlets(gauntlets)
    }
})