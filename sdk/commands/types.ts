import {rolesTable} from "~~/drizzle";

export type SDKCommandHandlerFunction = <T = unknown> (args: string[]) => MaybePromise<T>
export type SDKCommandHandlerPermission = Record<keyof typeof rolesTable.$inferSelect["privileges"], boolean>

export type SDKCommandHandler = {
    fn: SDKCommandHandlerFunction,
    permissions?: SDKCommandHandlerPermission
}