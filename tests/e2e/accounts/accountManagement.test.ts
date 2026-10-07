import {$fetchRaw} from "nitro-test-utils";

describe('accounts/accountManagement.php', () => {
    it("Redirects correctly", async () => {
        const BASE_URL = "/0000/db"
        const response = await $fetchRaw(`${BASE_URL}/accounts/accountManagement.php`)
        expect(response.status).toBe(301)
    })
});