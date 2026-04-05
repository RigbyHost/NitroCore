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

import {createHash} from "node:crypto";
import bcrypt from "bcrypt"

/**
 * Crypto/hashing utils
 */
export const useCrypto = () => ({
    md5: (data: string) => createHash("md5").update(data).digest("hex"),
    sha1: (data: string) => createHash("sha1").update(data).digest("hex"),
    sha256: (data: string) => createHash("sha256").update(data).digest("hex"),
    sha512: (data: string) => createHash("sha512").update(data).digest("hex"),
    bcrypt$10: {
        hash: (data: string) => bcrypt.hashSync(data, 10),
        compare: (data: string, hash: string) => bcrypt.compareSync(data, hash)
    }
})