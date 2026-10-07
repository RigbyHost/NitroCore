import {createHash} from "node:crypto";
import {$fetchRaw} from "nitro-test-utils";
import {eq} from "drizzle-orm";
import {usersTable} from "~~/drizzle";
import {useDrizzle} from "~/utils/useDrizzle";

export const BASE_URL = "/0000/db"

export const objectToForm = (o: object): FormData => {
    const form = new FormData()
    for (const [key, value] of Object.entries(o)) {
        form.append(key, value)
    }
    return form
}

/**
 * POSTs form data to a GD endpoint like the game client does
 * @returns Response status, body as text and `X-Message` header
 */
export const gdPost = async (path: string, data: object = {}) => {
    const response = await $fetchRaw(`${BASE_URL}/${path}`, {
        method: "POST",
        body: objectToForm(data),
        responseType: "text"
    })
    return {
        status: response.status,
        body: String(response.data),
        message: response.headers.get("x-message")
    }
}

/**
 * Splits GD `key:value:key:value` (or other separator) response into a map
 */
export const parseGDObject = (data: string, separator = ":") => {
    const parts = data.split(separator)
    const result: Record<string, string> = {}
    for (let i = 0; i + 1 < parts.length; i += 2)
        result[parts[i]] = parts[i + 1]
    return result
}

export const toGJP2 = (password: string) =>
    createHash("sha1").update(password + "mI29fmAnxgTs").digest("hex")

export const toLegacyGJP = (password: string) => {
    let xored = ""
    for (let i = 0; i < password.length; i++)
        xored += String.fromCharCode(password.charCodeAt(i) ^ "37526".charCodeAt(i % 5))
    return Buffer.from(xored, "binary").toString("base64")
        .replaceAll("/", "_")
        .replaceAll("+", "-")
}

let userCounter = 0

/**
 * Registers a fresh user through the API and (de)activates it directly in the database
 */
export const createUser = async ({active = true}: { active?: boolean } = {}) => {
    // Test files run in parallel workers, so ids need randomness rather than just a counter
    const id = `${Math.random().toString(36).slice(2, 10)}${userCounter++}`
    const username = `t_${id}`.slice(0, 20)
    // Unique per user so credentials of one test user never authenticate another
    const password = `Pass_${id}`
    const email = `${id}@test.local`

    const res = await gdPost("accounts/registerGJAccount.php", {userName: username, password, email})
    if (res.body !== "1")
        throw new Error(`Failed to register test user: ${res.body} (${res.message})`)

    const db = await useDrizzle("0000")
    const user = await db.query.usersTable.findFirst({
        where: (u, {eq}) => eq(u.username, username)
    })
    if (!user)
        throw new Error("Registered test user not found in database")

    await db.update(usersTable)
        .set({isBanned: active ? 0 : 1})
        .where(eq(usersTable.uid, user.uid))

    return {
        uid: user.uid,
        username,
        password,
        email,
        /** 2.2 GJP2 auth fields */
        auth: {accountID: user.uid, gjp2: toGJP2(password), gameVersion: 22},
        /** Pre-2.2 GJP auth fields */
        legacyAuth: {accountID: user.uid, gjp: toLegacyGJP(password), gameVersion: 21},
    }
}

export type TestUser = Awaited<ReturnType<typeof createUser>>
