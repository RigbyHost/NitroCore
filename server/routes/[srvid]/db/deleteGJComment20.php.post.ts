import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";

export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],
    handler: async (event) => {
        // TODO: Still cant implement because of fucking LevelLists and RobTop's shittiness
    }
})

const requestSchema = z.object({
    commentID: z.coerce.number().positive(),
    levelID: z.coerce.number()
})