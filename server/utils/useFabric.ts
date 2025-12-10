import EventEmitter from "eventemitter3";

type FabricEvents = Record<string, (...args: any) => any>

const fabric: Record<string, EventEmitter> = {
    default: new EventEmitter()
};

/**
 * Returns a fabric instance and a terminate function
 * @param name Optional fabric name, uses default fabric if not provided
 * @returns Fabric instance
 */
export const useFabric = <T extends FabricEvents>(name?: string) => {
    if (!name || name === "default")
        return fabric.default as unknown as EventEmitter<T>
    if (!fabric[name])
        fabric[name] = new EventEmitter()

    return fabric[name] as unknown as EventEmitter<T>
}

/**
 * Returns temporary fabric instance and a terminate function
 * @returns `[Fabric, terminateFabric]`
 */
export const useTemporalFabric = <T extends FabricEvents>() => {
    const name = crypto.randomUUID().toString()
    fabric[name] = new EventEmitter()
    const terminate = () => {
        fabric[name].removeAllListeners()
        delete fabric[name]
    }
    return [fabric[name] as unknown as EventEmitter<T>, terminate]
}

