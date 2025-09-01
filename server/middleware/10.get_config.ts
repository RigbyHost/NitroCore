export default defineEventHandler(async (event) => {
]

    const c = await useServerConfig()
    if (!c.config)
        return "-1"

    event.context.config = c
})