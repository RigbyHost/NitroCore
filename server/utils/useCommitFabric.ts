import EventEmitter from "eventemitter3";

let commitableFabric: EventEmitter<{
    commit: (commitable: Commitable) => void
}>

/**
 * Uses Fabric to asynchronously commit a commitable object.
 *
 * You need to use {@link setupCommitListener} first.
 */
export const useCommitFabric = async (
    commitable: Commitable,
    immediate = false
) => {
    if (immediate)
        return commitable.commit()
    if (!commitableFabric)
        commitableFabric = useFabric() as typeof commitableFabric
    commitableFabric.emit("commit", commitable)
}

export const setupCommitListener = () => {
    commitableFabric.on("commit", async commitable => {
        await commitable.commit()
    })
}