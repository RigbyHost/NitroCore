import {defineConfig} from "drizzle-kit";

export default defineConfig({
    dialect: "mysql",
    schema: "./drizzle",
    dbCredentials: {
        url: process.env.DB_URL!
    }
})