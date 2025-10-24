
export default defineEventHandler((event) => {
    const h = (header: string) => getHeader(event, header);
    event.context.clientAddress = h("cf-connecting-ip")
        || h("x-forwarded-for")
        || h("x-real-ip")
        || event.node.req.socket.remoteAddress;
})