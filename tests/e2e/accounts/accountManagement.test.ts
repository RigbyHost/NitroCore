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

import {$fetchRaw, injectServerUrl} from "nitro-test-utils";

describe('accounts/accountManagement.php', () => {
    it("Redirects correctly", async () => {
        const BASE_URL = `${injectServerUrl()}0000/db`
        const response = await $fetchRaw(`${BASE_URL}/accounts/accountManagement.php`)
        expect(response.status).toBe(301)
    })
});