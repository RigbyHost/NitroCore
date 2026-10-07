import {defineHandler} from "nitro";
import {redirect} from "nitro/h3";

export default defineHandler( event => {
    return redirect("https://rigby.host", 301)
})