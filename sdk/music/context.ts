import {createContext} from "unctx";
import {AsyncLocalStorage} from "node:async_hooks";
import {songsTable} from "~~/drizzle";

export const ctx = createContext<Context>({
    asyncContext: true,
    AsyncLocalStorage
})

export const useMusicContext = ctx.use

export type Context = {
    drizzle: Database,
    song?: typeof songsTable.$inferSelect
    songs: typeof songsTable.$inferSelect[]
}