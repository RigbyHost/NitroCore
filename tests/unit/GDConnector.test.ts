import {HTTPResponse} from "nitro/h3";
import {GDConnector} from "~/connectors/GeometryDash";

describe("GDConnector", () => {
    const connector = new GDConnector()

    const readResponse = async (res: unknown) => {
        expect(res).toBeInstanceOf(HTTPResponse)
        const response = res as HTTPResponse
        return {
            body: await new Response(response.body).text(),
            message: response.headers.get("x-message")
        }
    }

    it("Sends success with message header", async () => {
        expect(await readResponse(await connector.success("Done")))
            .toStrictEqual({body: "1", message: "Done"})
    })

    it("Sends numbered success with message header", async () => {
        expect(await readResponse(await connector.numberedSuccess(42, "Uploaded")))
            .toStrictEqual({body: "42", message: "Uploaded"})
    })

    it("Always sends -1 for errors, keeping the message", async () => {
        expect(await readResponse(await connector.error(-12, "Banned")))
            .toStrictEqual({body: "-1", message: "Banned"})
    })

    it("Formats account responses", async () => {
        expect(await connector.account.login(7)).toBe("7,7")
        expect(await connector.account.sync("data;22;42")).toBe("data;22;42;a;a")
    })

    it("Formats empty comment lists", async () => {
        expect(await connector.comments.getAccountComments([], 0, 0)).toBe("#0:0:0")
        expect(await connector.comments.getLevelComments([], 0, 0)).toBe("#0:0:0")
    })

    it("Formats comment command results", async () => {
        expect(await connector.comments.commentCommandResult("ok")).toBe("temp_1_ok")
    })

    it("Formats special level info", async () => {
        expect(await connector.quests.getSpecialLevel(5, 3600)).toBe("5|3600")
    })

    it("Formats top artists", async () => {
        expect(await connector.getTopArtists(["A", "B"], 0, 2)).toBe("4:A|4:B")
    })
})
