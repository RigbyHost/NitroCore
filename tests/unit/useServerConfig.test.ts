
describe('useServerConfig()', () => {
    it("Loads successfully valid ID", async () => {
        const {config, setConfig} = await useServerConfig("0000")
        expect(config).toBeDefined()
        expect(config).not.toBeNull()
        expect(setConfig).toBeDefined()
        expect(setConfig).toBeTypeOf("function")
        expect(config!.ServerConfig.SrvID).toBe("0000")
    })

    it("Fails at invalid ID", async () => {
        const {config} = await useServerConfig("nope")
        expect(config).toBeNull()
    })
});