/**
 * Debug-only output, enabled with `DEBUG=true` in env
 */
export const useDebug = () => {
    const enabled = process.env.DEBUG === "true"
    return {
        enabled,
        log: (...args: unknown[]) => {
            if (enabled)
                console.log(...args)
        }
    }
}
