import {describe, it, expect} from "vitest";
import {useCrypto} from "~/utils/useCrypto";
import {useGeometryDashTooling} from "~/utils/useGeometryDashTooling";
import {usePostObject} from "~/utils/usePostObject";

describe("Crypto Utils", ()=> {
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

describe("Geometry Dash Tooling", () => {
    const t = useGeometryDashTooling()

    it("Clears GD requests correctly", () => {
        expect(t.clearGDRequest("Mach:ine")).toBe("Mach")
        expect(t.clearGDRequest("Mach|ine")).toBe("Mach")
        expect(t.clearGDRequest("Mach~ine")).toBe("Mach")
        expect(t.clearGDRequest("Mach#ine")).toBe("Mach")
        expect(t.clearGDRequest("(Mac\0h)ine")).toBe("(Mach")
    })
})

describe("usePostObject", () => {
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