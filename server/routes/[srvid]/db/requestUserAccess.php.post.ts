import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {defineHandler} from "nitro";

export default defineHandler({
    middleware: [initMiddleware, authMiddleware],
    handler: async (event) => {
        const role = await event.context.user!.fetchRole()
        if (role && role.privileges.aReqMod) {
            return await event.context.connector.numberedSuccess(role.modLevel,"Yes, you are a mod")
        } else {
            return await event.context.connector.error(-1, "You do not have permission to perform this action")
        }
    }
})
