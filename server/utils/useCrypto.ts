import {createHash} from "node:crypto";

const sha1 = createHash("sha1")
const sha256 = createHash("sha256")
const sha512 = createHash("sha512")
const md5 = createHash("md5")

/**
 * Crypto/hashing utils
 */
export const useCrypto = () => ({
    md5: (data: string) => md5.update(data).digest("hex"),
    sha1: (data: string) => sha1.update(data).digest("hex"),
    sha256: (data: string) => sha256.update(data).digest("hex"),
    sha512: (data: string) => sha512.update(data).digest("hex"),
})