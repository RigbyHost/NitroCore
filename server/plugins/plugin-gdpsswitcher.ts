import {initMiddleware} from "~/gdps_middleware/init_gdps";

export default defineNitroPlugin(nitro => {
    nitro.router.get(
        "/:srvid/db/switcher/getInfo.php",
        defineEventHandler({
            onRequest: [initMiddleware],
            handler: async (event) => {
                if (!event.context.config?.config)
                    throw createError({
                        statusCode: 404,
                        message: "Not found"
                    })

                const {config} = event.context.config

                if (config.ServerConfig.EnableModules["gdpsswitcher"]) {
                    const switcherc = config.ServerConfig.ModuleConfig["gdpsswitcher"] as MaybeUndefined<{
                        motd: string,
                        icon: string
                    }>
                    return {
                        motd: switcherc?.motd || "GDPS Server powered by NitroCore",
                        icon: switcherc?.icon || "https://cdn.rigby.host/default_gdps.jpeg",
                        version: 1
                    }
                } else {
                    throw createError({
                        statusCode: 404,
                        message: "Not found"
                    })
                }
            }
        })
    )
})