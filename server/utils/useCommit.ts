
/**
 * Used to commit data to the database using {@link useCommitMiddleware}
 * @param commitable - Any object that has a commit method
 */
export const useCommit = (commitable: Commitable) => {
    const evt = useEvent()
    if (!evt.context.commitable)
        evt.context.commitable = new Array<Commitable>()
    evt.context.commitable.push(commitable)
}

/**
 * Middleware that commits all data to the database, should be used in {@link EventHandlerObject.onBeforeResponse}
 *
 * @example
 * defineEventHandler({
 *     onBeforeResponse: [useCommitMiddleware],
 *     handler: () => {...}
 * })
 */
export const useCommitMiddleware = defineEventHandler(async event => {
    const commitables = event.context.commitable
    if (!commitables)
        return
    for (const commitable of commitables) {
        await commitable.commit()
    }
})

export interface Commitable {
    commit: () => Promise<void>
}
