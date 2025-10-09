import {initMiddleware} from "~/gdps_middleware/init_gdps";

export default defineEventHandler({
    onRequest: [initMiddleware],
    handler: async (event) => {
        // TODO: Implement
    }
})
