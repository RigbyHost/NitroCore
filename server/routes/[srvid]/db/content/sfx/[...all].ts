import {defineHandler} from "nitro";
import {getRouterParam, redirect} from "nitro/h3";

export default defineHandler(async (event) => {
    const path = getRouterParam(event, "all")!
    return redirect(`https://geometrydashfiles.b-cdn.net/sfx/${path}`)
})