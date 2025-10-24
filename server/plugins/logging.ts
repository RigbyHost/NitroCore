import c from "tinyrainbow"

export default defineNitroPlugin(nitro => {
    nitro.hooks.hook("afterResponse", (event) => {
        useLogger().info([
            c.bgGreen(` ${event.node.res.statusCode} `),
            c.bgBlue(` ${event.method.padEnd(6)} `),
            c.white(event.context.clientAddress).padEnd(15),
            c.bold(event.node.req.url)
        ].join(""))
    })
})