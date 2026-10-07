import type {H3Event} from "nitro/h3";

export const usePostObject = <T = unknown>(form: FormData): T => {
    const o: Record<string, unknown> = {}
    form.forEach((value, key) => o[key] = value);
    return o as T
}

export const withPreparsedForm = async (event: Pick<H3Event, "req" | "context">) => {
    if (!event.context._preparsedBody)
        event.context._preparsedBody = await event.req.formData()
    return event.context._preparsedBody
}