import type {User} from "~~/controller/User";

declare module 'h3' {
    interface H3EventContext {
        config: Awaited<ReturnType<typeof useServerConfig>>
        drizzle: Database
        user?: User,
        commitable?: Array<Commitable>,
    }
}

export default {}