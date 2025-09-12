import {createStorage, Storage, StorageValue} from "unstorage";
import redisDriver, {RedisOptions} from "unstorage/drivers/redis"
import config from "~~/nitro.config"

let storage: MaybeUndefined<Storage> = undefined

export const useStorage = <T extends StorageValue>(s: string) => {
    if (!storage)
        storage = createStorage<T>({
            driver: redisDriver(config.devStorage![s] as RedisOptions)
        }) as any as Storage
    return storage as any as Storage<T>
}

