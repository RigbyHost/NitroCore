import {createContext} from "unctx";
import {AsyncLocalStorage} from "node:async_hooks";
import {H3EventContext} from "h3";


export const ctx = createContext<Context>({
    asyncContext: true,
    AsyncLocalStorage
})

export const useEventContext = ctx.use

export type Context = {
    drizzle: Database,
    config: H3EventContext['config']
}