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

- [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](./docs/deploy/vercel.md) — Free, easy to deploy
- [![Cloudflare](https://img.shields.io/badge/Cloudflare-000000?style=for-the-badge&logo=cloudflare&logoColor=orange)](./docs/deploy/cloudflare.md) — Free, requires separate postgres provider, not recommended for Russia
- [![Selfhosted/VDS](https://img.shields.io/badge/Standalone/VDS-000000?style=for-the-badge&logo=gnubash&logoColor=white)](./docs/deploy/standalone.md) — Not that free, for advanced users

## ✨ Highlights
- **🔧 Rich plugin system**: Easily extend NitroCore functionality using [our SDK](#sdk)
- **🚨 Strict input data validation**: Prevent bad data from breaking your server with Zod schemas and [`useGeometryDashTooling()`](./server/utils/useGeometryDashTooling.ts)
- **📁 Clean code**: Easy to understand code and best practices allow you start modifying core (or even contributing) in no time
- **🏭 Full support for hosting services**: You can deploy multiple servers using one instance, NitroCore supports distributed configurations natively
- **🤷‍♂️ It's a decent GDPS Core**, what else to ask?