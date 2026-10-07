import {createUser, gdPost, parseGDObject, type TestUser} from "~~/tests/core/utils";

describe("levels", () => {
    let owner: TestUser
    let stranger: TestUser
    let levelID: string
    const levelName = `TestLevel${Date.now().toString(36)}`
    const levelString = "H4sIAAAAAAAACq2QwQ3DIBAEW_IS2"

    beforeAll(async () => {
        owner = await createUser()
        stranger = await createUser()
    })

    it("Rejects upload without level data", async () => {
        const {body, message} = await gdPost("uploadGJLevel21.php", {...owner.auth, levelName})
        expect(body).toBe("-1")
        expect(message).toBe("Bad Request")
    })

    it("Rejects upload without auth", async () => {
        const {body, message} = await gdPost("uploadGJLevel21.php", {levelName, levelString})
        expect(body).toBe("-1")
        expect(message).toBe("Invalid credentials")
    })

    it("Uploads a level", async () => {
        const {body, message} = await gdPost("uploadGJLevel21.php", {
            ...owner.auth,
            levelName,
            levelString,
            levelDesc: Buffer.from("A test level").toString("base64"),
            objects: 150,
            requestedStars: 5,
        })
        expect(message).toBe("Level uploaded successfully")
        expect(Number(body)).toBeGreaterThan(0)
        levelID = body
    })

    it("Downloads the level", async () => {
        const {body} = await gdPost("downloadGJLevel22.php", {levelID})
        const level = parseGDObject(body.split("#")[0])
        expect(level["1"]).toBe(levelID)
        expect(level["2"]).toBe(levelName)
        expect(level["4"]).toBe(levelString)
        expect(level["6"]).toBe(owner.uid.toString())
    })

    it("Finds the level by name", async () => {
        const {body} = await gdPost("getGJLevels21.php", {str: levelName, gameVersion: 22})
        const levels = body.split("#")[0].split("|").map(l => parseGDObject(l))
        expect(levels.map(l => l["1"])).toContain(levelID)
    })

    it("Finds the level by id", async () => {
        const {body} = await gdPost("getGJLevels21.php", {str: levelID, gameVersion: 22})
        expect(parseGDObject(body.split("#")[0].split("|")[0])["1"]).toBe(levelID)
    })

    it("Likes the level", async () => {
        const {body, message} = await gdPost("likeGJItem211.php", {...stranger.auth, itemID: levelID, type: 1, like: 1})
        expect(body).toBe("1")
        expect(message).toBe("Level liked")
    })

    it("Forbids updating someone else's level", async () => {
        const {body, message} = await gdPost("uploadGJLevel21.php", {
            ...stranger.auth,
            levelID,
            levelName: "Hijacked",
            levelString,
        })
        expect(body).toBe("-1")
        expect(message).toBe("You are not the owner of this level")
    })

    it("Forbids deleting someone else's level", async () => {
        const {body, message} = await gdPost("deleteGJLevelUser20.php", {...stranger.auth, levelID})
        expect(body).toBe("-1")
        expect(message).toBe("You are not the owner of this level")
    })

    it("Updates own level", async () => {
        const {body} = await gdPost("uploadGJLevel21.php", {
            ...owner.auth,
            levelID,
            levelName: `${levelName}v2`,
            levelString,
            levelVersion: 2,
        })
        expect(body).toBe(levelID)

        const download = await gdPost("downloadGJLevel22.php", {levelID})
        const level = parseGDObject(download.body.split("#")[0])
        expect(level["2"]).toBe(`${levelName}v2`)
        expect(level["5"]).toBe("2")
    })

    it("Deletes own level", async () => {
        const del = await gdPost("deleteGJLevelUser20.php", {...owner.auth, levelID})
        expect(del.body).toBe("1")
        expect(del.message).toBe("Level deleted successfully")

        const {body, message} = await gdPost("downloadGJLevel22.php", {levelID})
        expect(body).toBe("-1")
        expect(message).toBe("Level not found")
    })
})
