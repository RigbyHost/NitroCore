import {createStorage, Storage, StorageValue} from "unstorage";
import redisDriver, {RedisOptions} from "unstorage/drivers/redis"
import config from "~~/nitro.config"

const getStorage = <T extends StorageValue>() => {
    let storage: MaybeUndefined<Storage<T>> = undefined
    return (s: string): Storage<T> => {
        if (!storage)
            storage = createStorage<T>({
                driver: redisDriver(config.devStorage![s] as RedisOptions)
            })
        return storage
    }
}

export const useStorage = <T extends StorageValue>(storage: string) => {
    const s = getStorage<T>()
    return s(storage)
}

