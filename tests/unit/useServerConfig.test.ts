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

import {after} from "node:test";

describe('useServerConfig()', () => {
    const mockEvent = (srvId: string) => ({ context: { srvId } } as any)
    
    it("Loads successfully valid ID", async () => {
        const {config, setConfig} = await useServerConfig(mockEvent("0000"))
        expect(config).toBeDefined()
        expect(config).not.toBeNull()
        expect(setConfig).toBeDefined()
        expect(setConfig).toBeTypeOf("function")
        expect(config!.ServerConfig.SrvID).toBe("0000")
    })

    it("Fails at invalid ID", async () => {
        const {config} = await useServerConfig(mockEvent("nope"))
        expect(config).toBeNull()
    })

    it("Updates atomically", async () => {
        const {config, setConfig} = await useServerConfig(mockEvent("0000"))
        expect(await setConfig({...config!, SecurityConfig: {...config!.SecurityConfig, AutoActivate: true}}))
        const {config: newConfig} = await useServerConfig(mockEvent("0000"))
        expect(newConfig!.SecurityConfig.AutoActivate).toBe(true)
    })

    afterAll(async () => {
        await useStorage("config").dispose()
    })
});