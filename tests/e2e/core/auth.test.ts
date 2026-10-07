import {createUser, gdPost, type TestUser} from "~~/tests/core/utils";

// getGJAccountComments20 is guarded by authMiddleware, so it's used to probe GJP auth.
// Its `accountID` param doubles as the auth account, so it's only defaulted when auth lacks one
const probe = (auth: object) => gdPost("getGJAccountComments20.php", {accountID: 1, ...auth})

describe("authMiddleware", () => {
    let user: TestUser

    beforeAll(async () => {
        user = await createUser()
    })

    it("Rejects missing credentials", async () => {
        const {body, message} = await probe({})
        expect(body).toBe("-1")
        expect(message).toBe("Invalid credentials")
    })

    it("Accepts 2.2 GJP2", async () => {
        const {message} = await probe(user.auth)
        expect(message).not.toBe("Invalid credentials")
    })

    it("Accepts pre-2.2 GJP", async () => {
        const {message} = await probe(user.legacyAuth)
        expect(message).not.toBe("Invalid credentials")
    })

    it("Rejects wrong GJP2", async () => {
        const {body, message} = await probe({...user.auth, gjp2: "0".repeat(40)})
        expect(body).toBe("-1")
        expect(message).toBe("Invalid credentials")
    })

    it("Rejects inactive user", async () => {
        const inactive = await createUser({active: false})
        const {body, message} = await probe(inactive.auth)
        expect(body).toBe("-1")
        expect(message).toBe("Invalid credentials")
    })
})
