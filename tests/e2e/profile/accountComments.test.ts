import {createUser, gdPost, parseGDObject, type TestUser} from "~~/tests/core/utils";

describe("account comments", () => {
    let user: TestUser
    const comment = Buffer.from("Hello from tests").toString("base64")

    beforeAll(async () => {
        user = await createUser()
    })

    it("Returns empty list for new user", async () => {
        const {body} = await gdPost("getGJAccountComments20.php", {...user.auth, accountID: user.uid})
        expect(body).toBe("#0:0:0")
    })

    it("Rejects empty comment", async () => {
        const {body, message} = await gdPost("uploadGJAccComment20.php", {...user.auth, comment: ""})
        expect(body).toBe("-1")
        expect(message).toBe("Bad Request")
    })

    it("Posts, lists and deletes a comment", async () => {
        const upload = await gdPost("uploadGJAccComment20.php", {...user.auth, comment})
        expect(upload.body).toBe("1")
        expect(upload.message).toBe("Comment posted")

        const list = await gdPost("getGJAccountComments20.php", {...user.auth, accountID: user.uid})
        const [comments, pagination] = list.body.split("#")
        expect(pagination).toBe("1:0:10")
        const posted = parseGDObject(comments.split("|")[0], "~")
        expect(posted["2"]).toBe(comment)
        expect(Number(posted["6"])).toBeGreaterThan(0)

        const del = await gdPost("deleteGJAccComment20.php", {...user.auth, commentID: posted["6"]})
        expect(del.body).toBe("1")
        expect(del.message).toBe("Comment deleted")

        const after = await gdPost("getGJAccountComments20.php", {...user.auth, accountID: user.uid})
        expect(after.body).toBe("#0:0:0")
    })
})
