import {pgTable, inet, integer, primaryKey} from "drizzle-orm/pg-core";

export const downloadsTable = pgTable("actions_downloads", {
    id: integer("id").notNull(),
    ip: inet("ip").notNull()
}, (table) => [
    primaryKey({
        columns: [table.id, table.ip]
    })
])