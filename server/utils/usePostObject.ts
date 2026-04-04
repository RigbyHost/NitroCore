import {H3Event} from "nitro/h3";

export const usePostObject = <T = unknown>(form: FormData): T => {
    const o: Record<string, unknown> = {}
    form.forEach((value, key) => o[key] = value);
    return o as T
}

export const withPreparsedForm = async (event: H3Event) => {
    if (!event.context._preparsedBody)
        event.context._preparsedBody = await event.req.formData()
    return event.context._preparsedBody
}