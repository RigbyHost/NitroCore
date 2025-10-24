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

## 🚀 Deploy now
Pick one of providers below and follow the instructions:

[![RigbyHost](https://img.shields.io/badge/RigbyHost-000000?style=for-the-badge&logo=rive&logoColor=orange)](https://rigby.host) — Free, easiest to deploy. Highly recommended

[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](./docs/deploy/vercel.md) — Free, easy to deploy

[![Cloudflare](https://img.shields.io/badge/Cloudflare-000000?style=for-the-badge&logo=cloudflare&logoColor=orange)](./docs/deploy/cloudflare.md) — Free, requires separate postgres provider, not recommended for Russia

[![Selfhosted/VDS](https://img.shields.io/badge/Standalone/VDS-000000?style=for-the-badge&logo=gnubash&logoColor=white)](./docs/deploy/standalone.md) — Not that free, for advanced users

## ✨ Highlights
- **🔧 Rich plugin system**: Easily extend NitroCore functionality using [our SDK](#sdk)
- **🔗 Strict input data validation**: Prevent bad data from breaking your server with Zod schemas and [`useGeometryDashTooling()`](./server/utils/useGeometryDashTooling.ts)
- **📁 Clean code**: Easy to understand code and best practices allow you start modifying core (or even contributing) in no time
- **🚨 Cheaters detection (v1.0 and newer)**: We use synthetic and ML tests to verify if your players are legitimate
- **🏭 Full support for hosting services**: You can deploy multiple servers using one instance, NitroCore supports distributed configurations natively
- **🤷‍♂️ It's a decent GDPS Core**, what else to ask?

## SDK

### Creating custom command
If you want to create custom command for your server, just create new file in `server/plugins` (ex: `server/plugins/mycommand.ts`)

```ts
// Nitro Plugin will automatically register on boot
export default defineNitroPlugin(() => {
    // Getting sdk for commands
    const csdk = useSDK().commands
    // Registering command
    csdk.register(
        "level", // Command type
        "mycommand", // Command name (Usage will be !mycommand [args])
        async (args: string[]) => {
            // Here we get command context with everything you might need:
            // User, Level, User Role, DB driver
            const context = useCommandContext()
            if (!context.level!.isOwnedBy(context.user.$.uid))
                throw new Error("You should be owner and have cLvlAccess")
            await context.level!.delete()
        },
        // You can specify which privileges role/user should have
        { cLvlAccess: true }
    )
})
```

`SDK/commands.register` and context signature:
```ts
function register(
    type: "level" | "lists" | "profile" | "global",
    command: string,
    // (args: string[]) => MaybePromise<any>
    handler: SDKCommandHandlerFunction,
    // {permission1: true, permission2: true}
    permissions?: SDKCommandHandlerPermission,
) {/* ... */}

type Context = {
    drizzle: Database,
    user: User,
    role: Nullable<typeof rolesTable.$inferSelect>,
    level?: Level, // Provided only when executing level command
    list?: List    // Provided only when executing list command
}
```

As you can see, core can register several types of commands:
- **`level`**: vanilla gd commands executed in level comments by moderators or level owners
- **`list`**: commands that are executed using level list comments
- **`profile`**: you can execute commands in profile comments too!
- **`global`**: If you want to register your command for all types, use global

> ⚠️ We don't guarantee that context will have all properties when using global type command as it can be executed everywhere


### Registering custom music provider
There is no universal solution to provide a way to use music from any music service. However, you can add your own using **Music Providers**.

Basically, database stores meta tags instead of direct URL. For example:
- **`http:https://files.catbox.moe/track.mp3`** — built-in http provider
- **`yt:dQw4w9WgXcQ`** — you can use your own api to get mp3 files from YouTube (don't forget to store these mp3 files to reduce latency!)
- **`mycustomtype:ABCDEF0123456789`** — your custom provider with any data that you want
- You can also do processing on the side and just provide plain `http` links

Our built-in HTTP provider example:
```ts
// Nitro Plugin will automatically register on boot
export default defineNitroPlugin(() => {
    // Getting sdk for music
    const msdk = useSDK().music
    // Registering music provider for "http" link type
    msdk.registerProvider("http", new HTTPProvider())
})

/*
 * Each provider has to implement getMusicById (for single tracks) and 
 * getBulkMusic (for multiple tracks to optimize requests by processing them together)
 */
class HTTPProvider implements SDKMusicProvider {
    getMusicById = async (id: string) => {
        const song = useMusicContext().song!
        // These values will overwrite DB track metadata
        return {
            name: song.name,
            author: song.artist,
            size: song.size,
            url: id,
            originalUrl: song.url // OriginalUrl is needed to match your metadata with existing tracks
        }
    }

    getBulkMusicById = async (ids: string[]) => {
        const songs = useMusicContext().songs
        return songs.map(song => ({
            name: song.name,
            author: song.artist,
            size: song.size,
            url: song.url.split("::", 1)[1],
            originalUrl: song.url
        }))
    }
}
```

Context type btw:
```ts
type Context = {
    drizzle: Database,
    song?: typeof songsTable.$inferSelect   // provided only when calling getMusicById (for bulk processing use `songs` field)
    songs: typeof songsTable.$inferSelect[] // if getMusicById provided, will contain one song entry
}
```

## License
Distributed under the GPLv3 License. See [LICENSE](https://github.com/RigbyHost/RigbyCore/blob/main/LICENSE) for more information.