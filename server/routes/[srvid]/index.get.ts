import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {defineHandler} from "nitro";

export default defineHandler({
    middleware: [initMiddleware],
    handler: async (event) => {
        const c = event.context.config.config!
        return {
            status: `Serving ${c.ServerConfig.SrvID} for ${event.context.clientAddress}`,
            pointer: event.context.matchedRoute?.route
        }
    }
})