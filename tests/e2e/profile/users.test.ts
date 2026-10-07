import {createUser, gdPost, parseGDObject, type TestUser} from "~~/tests/core/utils";

describe("user profiles", () => {
    let user: TestUser

    beforeAll(async () => {
        user = await createUser()
    })

    it("Returns user info anonymously", async () => {
        const {body} = await gdPost("getGJUserInfo20.php", {targetAccountID: user.uid})
        const info = parseGDObject(body)
        expect(info["1"]).toBe(user.username)
        expect(info["2"]).toBe(user.uid.toString())
    })

    it("Returns user info when authenticated", async () => {
        const {body} = await gdPost("getGJUserInfo20.php", {...user.auth, targetAccountID: user.uid})
        expect(parseGDObject(body)["1"]).toBe(user.username)
    })

    it("Fails for unknown user", async () => {
        const {body, message} = await gdPost("getGJUserInfo20.php", {targetAccountID: 999999999})
        expect(body).toBe("-1")
        expect(message).toBe("User not found")
    })

    it("Fails invalid schema", async () => {
        const {body, message} = await gdPost("getGJUserInfo20.php", {targetAccountID: "nope"})
        expect(body).toBe("-1")
        expect(message).toBe("Bad Request")
    })

    it("Finds user by name", async () => {
        const {body} = await gdPost("getGJUsers20.php", {str: user.username})
        const found = parseGDObject(body.split("#")[0].split("|")[0])
        expect(found["1"]).toBe(user.username)
        expect(found["16"]).toBe(user.uid.toString())
    })

    it("Reports missing search results", async () => {
        const {body, message} = await gdPost("getGJUsers20.php", {str: "no_such_user_here"})
        expect(body).toBe("-1")
        expect(message).toBe("User not found")
    })
})
