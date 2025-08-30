import EventEmitter from "eventemitter3";

let commitableFabric: EventEmitter<{
    commit: (commitable: Commitable) => void
}>

export const useCommitFabric = (commitable: Commitable) => {
    if (!commitableFabric)
        commitableFabric = useFabric() as typeof commitableFabric
    commitableFabric.emit("commit", commitable)
}

export const setupCommitListener = () => {
    commitableFabric.on("commit", async commitable => {
        await commitable.commit()
    })
}