import {createHash} from "node:crypto";
import bcrypt from "bcrypt"

/**
 * Crypto/hashing utils
 */
export const useCrypto = () => ({
    md5: (data: string) => createHash("md5").update(data).digest("hex"),
    sha1: (data: string) => createHash("sha1").update(data).digest("hex"),
    sha256: (data: string) => createHash("sha256").update(data).digest("hex"),
    sha512: (data: string) => createHash("sha512").update(data).digest("hex"),
    bcrypt$10: {
        hash: (data: string) => bcrypt.hashSync(data, 10),
        compare: (data: string, hash: string) => bcrypt.compareSync(data, hash)
    }
})