

const escapeHtml = unsafe => {
    return unsafe
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
};

const clearGDRequest = (request: string) => {
    return escapeHtml(request)
        .trim()
        .split(":")[0]
        .split("|")[0]
        .split("~")[0]
        .split("#")[0]
        .split(")")[0]
        .trim()
}

const doXOR = (data: string, key: string) => {
    let result = "";
    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

const getDateAgo = (date: number) => {
    const diff = Date.now()/1000 - date;
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
})