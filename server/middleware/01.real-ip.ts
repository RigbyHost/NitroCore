
export default defineEventHandler((event) => {
    const h = event.headers.get;
    console.log(event.context.clientAddress);
    event.context.clientAddress = h("cf-connecting-ip")
        || h("x-forwarded-for")
        || h("x-real-ip")
        || event.node.req.socket.remoteAddress;
})