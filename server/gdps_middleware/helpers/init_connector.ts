import {GDConnector} from "~/connectors/GeometryDash";

export const initConnectorMiddleware = defineEventHandler((event)=>{
    if (Object.keys(getQuery(event)).includes("json"))
        return
    else
        event.context.connector = new GDConnector()
})