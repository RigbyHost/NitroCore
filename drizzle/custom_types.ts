import {customType} from "drizzle-orm/mysql-core";

export const commaSeparated = customType<{ data: Array<number> }>({
    dataType: () => "text",
    fromDriver: (text) => {
        if (typeof text !== "string") return []
        const candidates = text.split(",").filter(v => v)
        return candidates.length
            ? candidates.map(Number)
            : []
    },
    toDriver: (value) => {
        if (!Array.isArray(value)) return ""
        return value.join(",")
    }
})