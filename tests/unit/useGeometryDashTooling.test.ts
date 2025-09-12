describe("useGeometryDashTooling()", () => {
    const t = useGeometryDashTooling()

    it("Clears GD requests correctly", () => {
        expect(t.clearGDRequest("Mach:ine")).toBe("Mach")
        expect(t.clearGDRequest("Mach|ine")).toBe("Mach")
        expect(t.clearGDRequest("Mach~ine")).toBe("Mach")
        expect(t.clearGDRequest("Mach#ine")).toBe("Mach")
        expect(t.clearGDRequest("(Mac\0h)ine")).toBe("(Mach")
    })
})