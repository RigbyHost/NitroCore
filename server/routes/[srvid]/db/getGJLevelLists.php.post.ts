import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {z} from "zod";
import {ListController} from "~~/controller/ListController";

const metrics = usePerformance()

export default defineEventHandler({
    onRequest: [initMiddleware],
    onBeforeResponse: [
        () => console.warn(metrics.getSteps())
    ],
    handler: async (event) => {
        metrics.reset()
        metrics.step("Read & parse body")
        const post = usePostObject<z.infer<typeof requestSchema>>(await readFormData(event))
        const {data, success} = requestSchema.safeParse(post)

        if (!success)
            return await event.context.connector.error(-1, "Bad Request")

        const listController = new ListController(event.context.drizzle)
        const filter = listController.getFilter()

        metrics.step("Search lists")
        // TODO: do
    }
})


export const requestSchema = z.object({
    type: z.coerce.number().optional().default(0),
    page: z.coerce.number().nonnegative().optional().default(0),
    str: z.string().optional().default("").transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    diff: z.string().nonempty()
        .regex(/^(\d(?:,\d)*|-)$/) // x,y,z... or - (empty)
        .optional().default("")
        .transform(
            value => value==="-" ? "" : value
        ).transform(
            value => value.split(",")
                .filter(v=>v.trim()) // Cleans empty values
                .map(v=>parseInt(v))
        ),
    demonFilter: z.coerce.number().nonnegative().optional(),
    star: z.coerce.number().optional(),
    followed: z.string().nonempty()
        .regex(/^(\d(?:,\d)*|-)$/) // x,y,z... or - (empty)
        .optional().default("")
        .transform(
            value => value==="-" ? "" : value
        ).transform(
            value => value.split(",")
                .filter(v=>v.trim()) // Cleans empty values
                .map(v=>parseInt(v))
        ),
})