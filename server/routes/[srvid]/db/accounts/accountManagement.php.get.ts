export default defineEventHandler( event => {
    return redirect(event, "https://rigby.host", 301)
})