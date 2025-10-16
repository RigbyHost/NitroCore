import type {User} from "~~/controller/User";
import {IConnector} from "~/connectors/IConnector";

declare module 'h3' {
    interface H3EventContext {
        config: Awaited<ReturnType<typeof useServerConfig>>
        drizzle: Database
        user?: User,
        connector: IConnector
    }
}

declare module 'nitropack' {
    interface NitroRuntimeConfig {
        platform?: string
    }
}

export default {}