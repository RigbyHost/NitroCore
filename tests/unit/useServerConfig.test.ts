import {after} from "node:test";

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

    it("Updates atomically", async () => {
        const {config, setConfig} = await useServerConfig("0000")
        expect(await setConfig({...config!, SecurityConfig: {...config!.SecurityConfig, AutoActivate: true}}))
        const {config: newConfig} = await useServerConfig("0000")
        expect(newConfig!.SecurityConfig.AutoActivate).toBe(true)
    })

    afterAll(async () => {
        await useStorage("config").dispose()
    })
});