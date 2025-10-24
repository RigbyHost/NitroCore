import {rolesTable} from "~~/drizzle";

export type SDKCommandHandlerFunction = (args: string[]) => any | Promise<any>
export type SDKCommandHandlerPermission = Partial<Record<keyof typeof rolesTable.$inferSelect["privileges"], boolean>>

export type SDKCommandHandler = {
    fn: SDKCommandHandlerFunction,
    permissions?: SDKCommandHandlerPermission
}