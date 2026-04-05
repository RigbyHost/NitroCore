/**
 * NitroCore - GDPS (Geometry Dash Private Server) implementation
 * Copyright (C) 2025 M41den <https://m41den.dev> and Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import {defineEventHandler, type H3Event} from 'nitro/h3';


export default defineEventHandler(async (event: H3Event) => {
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
        <p>is alive (maybe)</p>
    </body>
</html>
`
})
