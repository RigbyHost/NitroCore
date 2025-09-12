import {defineConfig} from 'nitro-test-utils/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import AutoImport from "unplugin-auto-import/vite"

export default defineConfig({
    plugins: [
        tsconfigPaths(),
        AutoImport({
            imports: [
                "vitest",
                {
                    "nitropack/config": ["defineNitroConfig"]
                }
            ],
            dirs: ['./server/utils', "./tests/mocks"],
            dts: "./tests/imports.d.ts"
        })
    ],
    test: {
        setupFiles: ["./tests/core/injector.ts"],
        globalSetup: ["./vitest.setup.ts"],
        coverage: {
            include: [
                "controller",
                "server"
            ],
            reporter: ["html", "text"]
        }
    }
})