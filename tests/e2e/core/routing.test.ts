import {$fetchRaw} from "nitro-test-utils";

describe("routing & gdps middleware", () => {
    it("Serves landing page as HTML", async () => {
        const response = await $fetchRaw("/", {responseType: "text"})
        expect(response.status).toBe(200)
        expect(response.headers.get("content-type")).toContain("text/html")
        expect(String(response.data)).toContain("NitroCore")
    })

    it("Serves server status for valid server", async () => {
        const response = await $fetchRaw<{ status: string, pointer: string }>("/0000")
        expect(response.status).toBe(200)
        expect(response.data!.status).toContain("Serving 0000")
        expect(response.data!.pointer).toBe("/:srvid")
    })

    it("Rejects malformed server id", async () => {
        const response = await $fetchRaw("/abc/db/getGJUsers20.php", {method: "POST"})
        expect(response.status).toBe(404)
    })

    it("Rejects unknown server id", async () => {
        const response = await $fetchRaw("/zzzz/db/getGJUsers20.php", {method: "POST"})
        expect(response.status).toBe(404)
    })

    it("Adds CORS headers from route rules", async () => {
        const response = await $fetchRaw("/", {headers: {origin: "https://example.com"}})
        expect(response.headers.get("access-control-allow-origin")).toBe("*")
    })

    it("Returns account URL for server", async () => {
        const response = await $fetchRaw("/0000/db/getAccountURL.php", {responseType: "text"})
        expect(response.status).toBe(200)
        expect(String(response.data)).toMatch(/\/0000\/db$/)
    })

    it("Redirects SFX requests to CDN", async () => {
        const response = await $fetchRaw("/0000/db/content/sfx/s123.ogg")
        expect(response.status).toBe(302)
        expect(response.headers.get("location")).toBe("https://geometrydashfiles.b-cdn.net/sfx/s123.ogg")
    })

    it("Hides GDPS switcher info when module is disabled", async () => {
        const response = await $fetchRaw("/0000/db/switcher/getInfo.php")
        expect(response.status).toBe(404)
    })
})
