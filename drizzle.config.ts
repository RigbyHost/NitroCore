import {defineConfig} from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: "./drizzle",
    dbCredentials: {
        url: process.env.DB_URL!
    }
})