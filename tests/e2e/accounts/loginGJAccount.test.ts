import {createUser, gdPost, toGJP2, type TestUser} from "~~/tests/core/utils";

describe("accounts/loginGJAccount.php", () => {
    let user: TestUser

    beforeAll(async () => {
        user = await createUser()
    })

    it("Fails invalid schema", async () => {
        const {body, message} = await gdPost("accounts/loginGJAccount.php", {})
        expect(body).toBe("-1")
        expect(message).toBe("Bad request")
    })

    it("Logs in with password", async () => {
        const {body} = await gdPost("accounts/loginGJAccount.php", {
            userName: user.username,
            password: user.password,
        })
        expect(body).toBe(`${user.uid},${user.uid}`)
    })

    it("Logs in with GJP2", async () => {
        const {body} = await gdPost("accounts/loginGJAccount.php", {
            userName: user.username,
            password: "unused",
            gjp2: toGJP2(user.password),
        })
        expect(body).toBe(`${user.uid},${user.uid}`)
    })

    it("Rejects wrong password", async () => {
        const {body, message} = await gdPost("accounts/loginGJAccount.php", {
            userName: user.username,
            password: "WrongPassword",
        })
        expect(body).toBe("-1")
        expect(message).toBe("Invalid credentials")
    })

    it("Rejects unknown user", async () => {
        const {body, message} = await gdPost("accounts/loginGJAccount.php", {
            userName: "definitely_missing",
            password: user.password,
        })
        expect(body).toBe("-1")
        expect(message).toBe("Invalid credentials")
    })

    it("Rejects inactive user", async () => {
        const inactive = await createUser({active: false})
        const {body, message} = await gdPost("accounts/loginGJAccount.php", {
            userName: inactive.username,
            password: inactive.password,
        })
        expect(body).toBe("-1")
        expect(message).toBe("Invalid credentials")
    })
})

describe("accounts/registerGJAccount.php duplicates", () => {
    it("Rejects taken username", async () => {
        const user = await createUser()
        const {body, message} = await gdPost("accounts/registerGJAccount.php", {
            userName: user.username,
            password: "AnotherPassword",
            email: `other_${user.email}`,
        })
        expect(body).toBe("-1")
        expect(message).toBe("Failed to register user")
    })

    it("Rejects taken email", async () => {
        const user = await createUser()
        const {body, message} = await gdPost("accounts/registerGJAccount.php", {
            userName: `${user.username.slice(0, 16)}_x`,
            password: "AnotherPassword",
            email: user.email,
        })
        expect(body).toBe("-1")
        expect(message).toBe("Failed to register user")
    })
})
