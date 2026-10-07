import type {User} from "~~/controller/User";
import type {IConnector} from "~/connectors/IConnector";
import type {Database} from "~/utils/useDrizzle";
import type {useServerConfig} from "~/utils/useServerConfig";

declare module 'h3' {
    interface H3EventContext {
        config: Awaited<ReturnType<typeof useServerConfig>>
        drizzle: Database
        user?: User,
        connector: IConnector,
        _preparsedBody?: FormData
    }
}

declare module 'nitro/types' {
    interface NitroRuntimeConfig {
        platform?: string
    }
}

export default {}
