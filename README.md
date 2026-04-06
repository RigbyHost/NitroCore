# ⚠️ ARCHIVED PROJECT
**This project is officially ARCHIVED.** NitroCore is no longer maintained. We've decided to move on due to the stagnation of the GDPS niche and the lack of a sustainable community. The code remains Open Source for educational purposes. 

---

<div align="center">
    <img src=".github/nitrocore_branding.png" width="128" />
</div>
<div align="center">
    <h1>NitroCore</h1>
    <h3>Modern Geometry Dash Core for Modern GDPS Servers ⚡</h3>
</div>

![](https://img.shields.io/badge/Supported%20Versions-%201.9—2.206-000000?style=for-the-badge&logo=v&logoColor=white)

**NitroCore is a fast and versatile GDPS core** that can be easily deployed anywhere.

---

## 🚀 Deploy
> [!CAUTION]
> **RigbyHost is SHUTTING DOWN.** You have 60 days to migrate your data. After that, this deployment option will be gone.

Pick one of providers below and follow the instructions:

- **Vercel** — Free, easy to deploy
- **Cloudflare** — Free, requires separate postgres provider
- **Standalone/VDS** — Not that free, for advanced users

## ✨ Highlights
- **🔧 Rich plugin system**: Easily extend NitroCore functionality using our SDK
- **🔗 Strict input data validation**: Prevent bad data from breaking your server with Zod schemas
- **📁 Clean code**: Easy to understand code and best practices
- **🚨 Cheaters detection**: We use synthetic and ML tests to verify if your players are legitimate
- **🏭 Full support for hosting services**: NitroCore supports distributed configurations natively

## SDK

### Creating custom command
If you want to create custom command for your server, just create new file in `server/plugins` (ex: `server/plugins/mycommand.ts`)

`
// Nitro Plugin will automatically register on boot
export default defineNitroPlugin(() => {
    const csdk = useSDK().commands
    csdk.register(
        "level", 
        "mycommand", 
        async (args: string[]) => {
            const context = useCommandContext()
            if (!context.level!.isOwnedBy(context.user.$.uid))
                throw new Error("You should be owner")
            await context.level!.delete()
        },
        { cLvlAccess: true }
    )
})
`

### Registering custom music provider
Example of registering a custom music provider to handle different source types:

`
export default defineNitroPlugin(() => {
    const msdk = useSDK().music
    msdk.registerProvider("http", new HTTPProvider())
})
`

## 🧠 Maintainers mental health
gone 💀

![gone](https://media1.tenor.com/m/XGouDAiIKn4AAAAC/bocchi-the-rock-hitori-gotoh.gif)

---

## License
Distributed under the GPLv3 License. See LICENSE for more information.
