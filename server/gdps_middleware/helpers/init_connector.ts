import {GDConnector} from "~/connectors/GeometryDash";
import {defineHandler} from "nitro";
import {getQuery} from "nitro/h3";

export const initConnectorMiddleware = defineHandler((event)=>{
    if (Object.keys(getQuery(event)).includes("json"))
        return
    else
        event.context.connector = new GDConnector()
})