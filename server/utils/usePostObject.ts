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

import {H3Event} from "nitro/h3";

export const usePostObject = <T = unknown>(form: FormData): T => {
    const o: Record<string, unknown> = {}
    form.forEach((value, key) => o[key] = value);
    return o as T
}

export const withPreparsedForm = async (event: H3Event): Promise<FormData> => {
    if (!event.context?._preparsedBody)
        event.context._preparsedBody = await event.req.formData()
    return event.context._preparsedBody as FormData
}