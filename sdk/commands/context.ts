import {createContext} from "unctx";
import {User} from "~~/controller/User";
import {Level} from "~~/controller/Level";
import {rolesTable} from "~~/drizzle";
import {List} from "~~/controller/List";
import {AsyncLocalStorage} from "node:async_hooks";

export const ctx = createContext<Context>({
    asyncContext: true,
    AsyncLocalStorage
})

export const useCommandContext = ctx.use

export type Context = {
    drizzle: Database,
    user: User,
    role: Nullable<typeof rolesTable.$inferSelect>,
    level?: Level,
    list?: List
}