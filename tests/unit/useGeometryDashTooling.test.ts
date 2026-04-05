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

describe("useGeometryDashTooling()", () => {
    const t = useGeometryDashTooling()

    it("Clears GD requests correctly", () => {
        expect(t.clearGDRequest("Mach:ine")).toBe("Mach")
        expect(t.clearGDRequest("Mach|ine")).toBe("Mach")
        expect(t.clearGDRequest("Mach~ine")).toBe("Mach")
        expect(t.clearGDRequest("Mach#ine")).toBe("Mach")
        expect(t.clearGDRequest("(Mac\0h)ine")).toBe("(Mach")
    })

    it("XORs correctly", () => {
        expect(t.doXOR("mogging", "1234567")).toBe("\\]TS\\XP")
    })

    it ("Transforms date correctly", () => {
        const date = new Date()
        expect(t.getDateAgo(date.setSeconds(date.getSeconds() - 1))).toBe("1 seconds")
        expect(t.getDateAgo(date.setMinutes(date.getMinutes() - 1))).toBe("1 minutes")
        expect(t.getDateAgo(date.setHours(date.getHours() - 1))).toBe("1 hours")
        expect(t.getDateAgo(date.setDate(date.getDate() - 1))).toBe("1 days")
        expect(t.getDateAgo(date.setDate(date.getDate() - 10))).toBe("1 weeks")
        expect(t.getDateAgo(date.setMonth(date.getMonth() - 1))).toBe("1 months")
        expect(t.getDateAgo(date.setFullYear(date.getFullYear() - 1))).toBe("1 years")
    })

    it ("Hashes solo correctly", () => {
        // Bruv this shit CANNOT be tested properly, doing this for coverage
        expect(t.hashSolo("Mach:ine")).toMatchSnapshot()
        expect(t.hashSolo2("Mach:ine")).toMatchSnapshot()
        expect(t.hashSolo3("Mach:ine")).toMatchSnapshot()
        expect(t.hashSolo4("Mach:ine")).toMatchSnapshot()
    })

    it("Does GJP correctly", () => {
        // Idk at least it's fucking consistent
        expect(t.doGJP("Mach:ine")).toMatchSnapshot()
        expect(t.doGJP2("Mach:ine")).toMatchSnapshot()
    })

    it ("Parses GD Version correctly", async () => {
        const form = new FormData()
        const mockEvent = {} as any
        expect(await t.getGDVersionFromBody(mockEvent, form)).toBe(21)
        form.set("gameVersion", "10")
        expect(await t.getGDVersionFromBody(mockEvent, form)).toBe(10)
        form.set("gameVersion", "20")
        form.set("binaryVersion", "27")
        expect(await t.getGDVersionFromBody(mockEvent, form)).toBe(20)
        form.set("binaryVersion", "28")
        expect(await t.getGDVersionFromBody(mockEvent, form)).toBe(21)
        form.set("gameVersion", "21")
        form.set("binaryVersion", "37")
        expect(await t.getGDVersionFromBody(mockEvent, form)).toBe(22)
    })
})