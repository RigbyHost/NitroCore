import {$fetchRaw, injectServerUrl} from "nitro-test-utils";

describe('accounts/accountManagement.php', () => {
    it("Redirects correctly", async () => {
        const BASE_URL = `${injectServerUrl()}0000/db`
        const response = await $fetchRaw(`${BASE_URL}/accounts/accountManagement.php`)
        expect(response.status).toBe(301)
    })
});