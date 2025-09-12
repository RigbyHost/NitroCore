
describe("useDrizzle()", () => {
    it("Gets database successfully", async () => {
        expect(await useDrizzle("0000")).toBeDefined()
    })
    it("Closes connections yay", async () => {
        expect(await useDrizzlePoolManager().closeOne("0000"))
        expect(await useDrizzlePoolManager().closeAll())
    })
})