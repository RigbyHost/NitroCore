import {ActionData} from "~~/drizzle";
import {Context} from "~~/sdk/events/context";
import {type ArgumentTypes} from "~/utils/types";

export type ActionListener = (
    uid: number,
    targetId: number,
    data: ActionData
) => void | Promise<void>

export type ActionInvoker = (context: Context, ...data: ArgumentTypes<ActionListener>) => Promise<void>