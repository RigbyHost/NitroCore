import {initMiddleware} from "~/gdps_middleware/init_gdps";

export default defineEventHandler({
    onRequest: [initMiddleware],
    handler: async (event) => {
        const c = event.context.config.config!
        return {
            status: `Serving ${c.ServerConfig.SrvID} for ${event.context.clientAddress}`,
            pointer: event.context.matchedRoute
        }
    }
})