import EventEmitter from "eventemitter3";

const fabric: Record<string, EventEmitter> = {
    default: new EventEmitter()
};

/**
 * Returns a fabric instance and a terminate function
 * @param name Optional fabric name, uses default fabric if not provided
 * @returns Fabric instance
 */
export const useFabric = (name?: string) => {
    if (!name || name === "default") return fabric.default
    if (!fabric[name])
        fabric[name] = new EventEmitter()

    return fabric[name]
}

/**
 * Returns temporary fabric instance and a terminate function
 * @returns `[Fabric, terminateFabric]`
 */
export const useTemporalFabric = () => {
    const name = crypto.randomUUID().toString()
    fabric[name] = new EventEmitter()
    const terminate = () => {
        fabric[name].removeAllListeners()
        delete fabric[name]
    }
    return [fabric[name], terminate]
}
