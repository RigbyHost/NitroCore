import {defineHandler} from "nitro";
import {getRequestIP} from "nitro/h3";

export default defineHandler((event) => {
    const h = (header: string) => event.req.headers.get(header);
    event.context.clientAddress = h("cf-connecting-ip")
        || h("x-forwarded-for")
        || h("x-real-ip")
        || getRequestIP(event);
})
