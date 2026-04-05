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

import EventEmitter from "eventemitter3";

type FabricEvents = Record<string, (...args: any) => any>

const fabric: Record<string, EventEmitter> = {
    default: new EventEmitter()
};

/**
 * Returns a fabric instance and a terminate function
 * @param name Optional fabric name, uses default fabric if not provided
 * @returns Fabric instance
 */
export const useFabric = <T extends FabricEvents>(name?: string) => {
    if (!name || name === "default")
        return fabric.default as unknown as EventEmitter<T>
    if (!fabric[name])
        fabric[name] = new EventEmitter()

    return fabric[name] as unknown as EventEmitter<T>
}

/**
 * Returns temporary fabric instance and a terminate function
 * @returns `[Fabric, terminateFabric]`
 */
export const useTemporalFabric = <T extends FabricEvents>() => {
    const name = crypto.randomUUID().toString()
    const eventEmitter = new EventEmitter()
    fabric[name] = eventEmitter
    const terminate = () => {
        fabric[name]?.removeAllListeners()
        delete fabric[name]
    }
    return [eventEmitter as unknown as EventEmitter<T>, terminate]
}

