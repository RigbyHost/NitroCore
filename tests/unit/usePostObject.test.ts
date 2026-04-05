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

describe("usePostObject()", () => {
    it("Parses body correctly", async () => {
        const form = new FormData()
        form.append("turbo", "Rigby")
        form.append("cat", "fast")
        form.append("Every Day", "I'm Shuffling")

        expect(
            await usePostObject(form)
        ).toStrictEqual({
            turbo: "Rigby",
            cat: "fast",
            "Every Day": "I'm Shuffling"
        })
    })
})