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

describe("useCrypto()", ()=> {
    it("Hashes MD5 correctly", () => {
        expect(
            useCrypto().md5("NitrousRigby")
        ).toBe("fcc1a9fc5a7b5828916653faa47bff5d")
    })

    it("Hashes SHA1 correctly", () => {
        expect(
            useCrypto().sha1("NitrousRigby")
        ).toBe("e063ab6f7987a8b603c4816d093599c30fe082f0")
    })

    it("Hashes SHA256 correctly", () => {
        expect(
            useCrypto().sha256("NitrousRigby")
        ).toBe("bc64355cc949d1d8e8ef57c77591a77add382613775284d7a4c80e82426b0fe9")
    })

    it("Hashes SHA512 correctly", () => {
        expect(
            useCrypto().sha512("NitrousRigby")
        ).toBe("b6e0449946e954358924dc3b8e022ab4bec5d307459d193cd0dd21e479f3c96837c5d1f6e14c6e0b9e5159ad7f096a51274ecc231d9398149e9c34b644db812f")
    })
})