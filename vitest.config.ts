import {defineConfig} from 'nitro-test-utils/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import AutoImport from "unplugin-auto-import/vite"
import {fileURLToPath} from "node:url";

export default defineConfig({
    plugins: [
        tsconfigPaths(),
        AutoImport({
            imports: [
                "vitest"
            ],
            dirs: ['./server/utils', "./tests/mocks"],
            dts: "./tests/imports.d.ts"
        })
    ],
    resolve: {
        alias: {
            // Unit tests run outside of Nitro, so runtime utils imported by server/utils are mocked
            "nitro/storage": fileURLToPath(new URL("./tests/mocks/useStorage.ts", import.meta.url)),
            "nitro/runtime-config": fileURLToPath(new URL("./tests/mocks/useRuntimeConfig.ts", import.meta.url)),
        }
    },
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
