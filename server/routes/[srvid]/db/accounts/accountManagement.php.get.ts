export default defineEventHandler( event => {
    return sendRedirect(event, "https://rigbyhost.com", 301)
})