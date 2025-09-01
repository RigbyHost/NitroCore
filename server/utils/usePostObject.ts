import {z} from "zod";


export const usePostObject = <T = unknown>(form: FormData): T => {
    const o: Record<string, unknown> = {}
    form.forEach((value, key) => o[key] = value);
    return o as T
}
