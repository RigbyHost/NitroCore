
declare module 'h3' {
    interface H3EventContext {
        drizzle?: Database
        user?: User,
        commitable?: Array<Commitable>
    }
}

export default {}