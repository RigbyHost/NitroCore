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
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {injectServerUrl, $fetchRaw} from "nitro-test-utils";
import {requestSchema} from "~/routes/[srvid]/db/accounts/registerGJAccount.php.post";
import {z} from "zod";
import {objectToForm} from "~~/tests/core/utils";

let alreadyRegistered = false

describe('accounts/registerGJAccount.php', () => {
    it("Fails invalid schema", async () => {
        const BASE_URL = `${injectServerUrl()}0000/db`

        const data: z.infer<typeof requestSchema> = {
            userName: "",
            password: "",
            email: ""
        }

        const response = await $fetchRaw(`${BASE_URL}/accounts/registerGJAccount.php`, {
            method: "POST",
            body: objectToForm(data)
        })

        expect(response?.data.toString()).toBe("-1")
        expect(response?.headers.get("x-message")).toBe("Bad request")
    })

    it("Registers user successfully", async () => {
        if (alreadyRegistered) return

        const BASE_URL = `${injectServerUrl()}0000/db`

        const id = Math.floor(Math.random()*1000)
        const data: z.infer<typeof requestSchema> = {
            userName: `MegaUser${id}`,
            password: "MegaPassword",
            email: `realemail${id}@realmail.com`
        }

        const response = await $fetchRaw(`${BASE_URL}/accounts/registerGJAccount.php`, {
            method: "POST",
            body: objectToForm(data)
        })

        // For successful registration, expect "1" in response body
        expect(response?.data?.toString()).toBe("1")
        expect(response?.headers?.get?.('x-message')).toBe('User registered successfully')
        alreadyRegistered = true
    })
});
