import {defineConfig} from "drizzle-kit";

if (process.env.DATABASE_URL) {
    console.log("Detected possible Postgres Neon")
    process.env.DB_URL = process.env.DATABASE_URL
}
if (process.env.POSTGRES_URL) {
    console.log("Detected possible Supabase")
    process.env.DB_URL = process.env.POSTGRES_URL
}

export default defineConfig({
    dialect: "postgresql",
    schema: "./drizzle",
    out: "./migrations",
    dbCredentials: {
        url: process.env.DB_URL!
    }
})