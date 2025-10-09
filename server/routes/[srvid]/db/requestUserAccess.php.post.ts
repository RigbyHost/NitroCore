import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";

export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],
    handler: async (event) => {
        const role = await event.context.user!.fetchRole()
        if (role && role.privileges.aReqMod) {
            await event.context.connector.numberedSuccess(role.modLevel,"Yes, you are a mod")
        } else {
            await event.context.connector.error(-1, "You do not have permission to perform this action")
        }
    }
})
