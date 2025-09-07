import { defineConfig } from 'nitro-test-utils/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        setupFiles: ["./vitest.setup.ts"],
    }
})