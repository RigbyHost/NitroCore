
export default defineTask({
    meta: {
        description: "Refreshes SFX library for GDPS"
    },
    run: async ({payload}) => {
        return {result: true}
    }
})