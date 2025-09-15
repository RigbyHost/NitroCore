import {injectServerUrl, $fetchRaw} from "nitro-test-utils";
import {requestSchema} from "~/routes/[srvid]/db/accounts/registerGJAccount.php.post";
import {z} from "zod";
import {objectToForm} from "~~/tests/core/utils";

let alreadyRegistered = false

describe('accounts/registerGJAccount.php', () => {
    it("Fails invalid schema", async () => {
        const BASE_URL = `${injectServerUrl()}0000/db`

        const data: z.infer<typeof requestSchema> = {
            userName: "",
            password: "",
            email: ""
        }

        const response = await $fetchRaw(`${BASE_URL}/accounts/registerGJAccount.php`, {
            method: "POST",
            body: objectToForm(data)
        })

        expect(response.data.toString()).toBe("-1")
        expect(response.headers.get("x-message")).toBe("Bad request")
    })

    it("Registers user successfully", async () => {
        if (alreadyRegistered) return

        const BASE_URL = `${injectServerUrl()}0000/db`

        const id = Math.floor(Math.random()*1000)
        const data: z.infer<typeof requestSchema> = {
            userName: `MegaUser${id}`,
            password: "MegaPassword",
            email: `realemail${id}@realmail.com`
        }

        const response = await $fetchRaw(`${BASE_URL}/accounts/registerGJAccount.php`, {
            method: "POST",
            body: objectToForm(data)
        })

        expect(response.data.toString()).toBe("1")
        alreadyRegistered = true
    })
});