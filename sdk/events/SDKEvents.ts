/**
 * NitroCore - GDPS (Geometry Dash Private Server) implementation
 * Copyright (C) 2025 M41den <https://m41den.dev> and Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www?.gnu.org/licenses/>.
 */

import {type AvailableActions} from "~~/controller/ActionController";
import {type ActionInvoker, type ActionListener} from "~~/sdk/events/types";
import {type ActionData} from "~~/drizzle";
import {ctx, type Context} from "~~/sdk/events/context";

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