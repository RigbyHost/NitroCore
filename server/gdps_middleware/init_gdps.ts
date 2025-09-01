import {validateSrvIdMiddleware} from "~/gdps_middleware/helpers/validate_srvid";
import {getServerConfigMiddleware} from "~/gdps_middleware/helpers/get_serverconfig";
import {checkIPBansMiddleware} from "~/gdps_middleware/helpers/check_ip_bans";
import {getDrizzleMiddleware} from "~/gdps_middleware/helpers/get_drizzle";
import {initConnectorMiddleware} from "~/gdps_middleware/helpers/init_connector";

export const initMiddleware = defineEventHandler({
    onRequest: [validateSrvIdMiddleware, getServerConfigMiddleware, checkIPBansMiddleware, getDrizzleMiddleware, initConnectorMiddleware],
    handler: () => {}
})