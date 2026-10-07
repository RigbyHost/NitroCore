import {defineHandler} from "nitro";
import {useDrizzle} from "~/utils/useDrizzle";

export const getDrizzleMiddleware = defineHandler(async event => {
    event.context.drizzle = await useDrizzle()
})