import {AvailableActions} from "~~/controller/ActionController";
import {ActionInvoker, ActionListener} from "~~/sdk/events/types";
import {ActionData} from "~~/drizzle";
import {ctx, Context} from "~~/sdk/events/context";
import {type ArgumentTypes} from "~/utils/types";
import {useFabric} from "~/utils/useFabric";

export class SDKEvents {
    constructor() {
    }

    onAction = (
        action: AvailableActions,
        listener: ActionListener,
    ) => {
        const invoke = async (context: Context, ...data: ArgumentTypes<ActionListener>) => {
            return await ctx.callAsync(context, async () => {
                return listener(...data)
            })
        }
        useFabric<Record<AvailableActions, ActionInvoker>>("actions").on(action, invoke)
    }

    emitAction = (
        action: AvailableActions,
        uid: number,
        targetId: number,
        data: ActionData,
        context: Context,
    ) => {
        useFabric<Record<AvailableActions, ActionInvoker>>("actions").emit(action, context, uid, targetId, data)
    }
}