export default defineEventHandler( event => {
    return sendRedirect(event, "https://rigby.host", 301)
})