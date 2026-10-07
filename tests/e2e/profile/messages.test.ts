import {createUser, gdPost, parseGDObject, type TestUser} from "~~/tests/core/utils";

describe("messages", () => {
    let sender: TestUser
    let receiver: TestUser
    const subject = Buffer.from("Test subject").toString("base64")
    const text = "dGVzdCBtZXNzYWdlIGJvZHk"

    beforeAll(async () => {
        sender = await createUser()
        receiver = await createUser()
    })

    it("Reports empty inbox", async () => {
        const {body, message} = await gdPost("getGJMessages20.php", receiver.auth)
        expect(body).toBe("-1")
        expect(message).toBe("No messages")
    })

    it("Sends, lists, reads and deletes a message", async () => {
        const send = await gdPost("uploadGJMessage20.php", {
            ...sender.auth,
            toAccountID: receiver.uid,
            subject,
            body: text,
        })
        expect(send.body).toBe("1")
        expect(send.message).toBe("Message sent")

        const inbox = await gdPost("getGJMessages20.php", receiver.auth)
        const [messages, pagination] = inbox.body.split("#")
        expect(pagination).toBe("1:0:10")
        const received = parseGDObject(messages.split("|")[0])
        expect(received["2"]).toBe(sender.uid.toString())
        expect(received["4"]).toBe(subject)
        expect(received["6"]).toBe(sender.username)
        expect(received["9"]).toBe("0")

        const outbox = await gdPost("getGJMessages20.php", {...sender.auth, getSent: 1})
        const sent = parseGDObject(outbox.body.split("#")[0].split("|")[0])
        expect(sent["1"]).toBe(received["1"])
        expect(sent["6"]).toBe(receiver.username)
        expect(sent["9"]).toBe("1")

        const read = await gdPost("downloadGJMessage20.php", {...receiver.auth, messageID: received["1"]})
        const full = parseGDObject(read.body)
        expect(full["1"]).toBe(received["1"])
        expect(full["5"]).toBe(text)

        const del = await gdPost("deleteGJMessages20.php", {...receiver.auth, messageID: received["1"]})
        expect(del.body).toBe("1")
    })

    it("Rejects message without body", async () => {
        const {body, message} = await gdPost("uploadGJMessage20.php", {...sender.auth, toAccountID: receiver.uid})
        expect(body).toBe("-1")
        expect(message).toBe("Bad Request")
    })
})
