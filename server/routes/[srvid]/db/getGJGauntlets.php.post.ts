import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {LevelPackController} from "~~/controller/LevelPackController";
import {defineHandler} from "nitro";

export default defineHandler({
    middleware: [initMiddleware],

    handler: async (event) => {
        const levelPackController = new LevelPackController(event.context.drizzle)

        const gauntlets = await levelPackController.getGauntlets()

        return await event.context.connector.levels.getGauntlets(gauntlets)
    }
})