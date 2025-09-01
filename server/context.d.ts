
declare module 'h3' {
    interface H3EventContext {
        wantsGDPS: boolean,
        config: Awaited<ReturnType<typeof useServerConfig>>
        drizzle: Database
        user?: User,
        commitable?: Array<Commitable>,
    }
}

export default {}