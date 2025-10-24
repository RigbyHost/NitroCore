
export default defineEventHandler(async (event) => {
    const getBranding = () => {
        switch (useRuntimeConfig().platform) {
            case "vercel": return "▲ Vercel"
            case "cloudflare": return "☁️ Cloudflare"
            case "standalone": return "⊟ Self-hosted"
            default: return "⚡ RigbyHost"
        }
    }
    return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>NitroCore</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-black h-screen flex flex-col justify-center items-center text-white">
        <img src="/logo.png" class="w-32" />
        <a href="https://github.com/rigbyhost/nitrocore" class="text-4xl font-semibold cursor-pointer hover:underline">NitroCore</a>
        <p>Running on ${getBranding()}</p>
    </body>
</html>
`
})