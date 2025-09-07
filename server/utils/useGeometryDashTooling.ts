

/**
 * Clears a Geometry Dash request
 * @author Cvolton
 */
const clearGDRequest = (request: string) => {
    return request.trim()
        .split(":")[0]
        .split("|")[0]
        .split("~")[0]
        .split("#")[0]
        .split(")")[0]
        .replace("\0","")
        .trim()
}

/**
 * XORs 2 strings to perform GD shenanigans
 */
const doXOR = (data: string, key: string) => {
    let result = "";
    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

/**
 * Used to mark comments as "X hours ago" or "X days ago" instead of unix timestamp
 * @returns String representing the time difference. Example: "2 hours" [ago]
 */
const getDateAgo = (date: number) => {
    const diff = (Date.now() - date)/1000;
    if (diff < 60) return `${diff} seconds`;
    if (diff < 3600) return `${Math.floor(diff/60)} minutes`;
    if (diff < 86400) return `${Math.floor(diff/3600)} hours`;
    if (diff < 604800) return `${Math.floor(diff/86400)} days`;
    if (diff < 604800*4) return `${Math.floor(diff/604800)} weeks`;
    if (diff < 604800*4*12) return `${Math.floor(diff/604800*4)} months`;
    return `${Math.floor(diff/(604800*4*12))} years`;
}

const hashSolo = (levelstring: string) => {
    const hash = Buffer.alloc(40);
    let p = 0;
    const plen = levelstring.length;
    for (let i = 0; i < plen; i += (plen / 40)) {
        if (p > 39) break;
        hash[p] = levelstring.charCodeAt(i);
        p++;
    }
    return useCrypto().sha1(hash+"xI25fpAapCQg")
}

const hashSolo2 = (lvlstring: string) => {
    return useCrypto().sha1(lvlstring+"xI25fpAapCQg")
}

const hashSolo3 = (lvlstring: string) => {
    return useCrypto().sha1(lvlstring+"oC36fpYaPtdg")
}

const hashSolo4 = (lvlstring: string) => {
    return useCrypto().sha1(lvlstring+"pC26fpYaQCtg")
}

const doGJP = (gjp: string) => {
    gjp = gjp.replaceAll("_", "/").replaceAll("-", "+")
    const block = Buffer.from(gjp, "base64").toString("binary")
    return doXOR(block, "37526")
}

const doGJP2 = (password: string) => {
    return useCrypto().sha1(password+"mI29fmAnxgTs")
}

/**
 * Gets the Geometry Dash version from the {@link H3Event} body or `postData` param
 *
 * @returns The Geometry Dash version: "1.9","2.0", "2.1", "2.2"
 */
const getGDVersionFromBody = async (postData?: FormData) => {
    const post = postData || await readFormData(useEvent())
    let version = 21
    if (post.has("gameVersion")) {
        const parsed = post.get("gameVersion") as string
        if (!isNaN(Number(parsed)))
            version = Number(parsed)
    }

    if (post.has("binaryVersion")) {
        // NaN is not greater or less than any number
        if (version === 20 && Number(post.get("binaryVersion")) > 27)
            version++

        if (version === 21 && Number(post.get("binaryVersion")) > 36)
            version++
    }

    return version
}

/**
 * Geometry-dash specific tooling like GJP and Solo hashing
 */
export const useGeometryDashTooling = () => ({
    clearGDRequest,
    doXOR,
    getDateAgo,
    hashSolo,
    hashSolo2,
    hashSolo3,
    hashSolo4,
    doGJP,
    doGJP2,
    getGDVersionFromBody
})