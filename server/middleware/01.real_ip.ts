
export default defineEventHandler((event) => {
    const h = (header: string) => event.req.headers.get(header);
    event.context.clientAddress = h("cf-connecting-ip")
        || h("x-forwarded-for")
        || h("x-real-ip")
        || (event.node?.req?.socket?.remoteAddress);
})