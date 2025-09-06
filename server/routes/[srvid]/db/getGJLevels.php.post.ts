import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {z} from "zod";
import {LevelController} from "~~/controller/LevelController";

const metrics = usePerformance()

export default defineEventHandler({
    onRequest: [initMiddleware],
    onBeforeResponse: [
        () => console.warn(metrics.getSteps())
    ],

    handler: async (event) => {
        metrics.reset()
        metrics.step("Read & parse body")
        const form = await readFormData(event)
        const post = usePostObject<z.infer<typeof requestSchema>>(form)
        const {data, success} = requestSchema.safeParse(post)
        if (!success)
            return await event.context.connector.error(-1, "Bad Request")


        const levelController = new LevelController(event.context.drizzle)
        const filter = levelController.getFilter()

        let result: {
            levels: number[],
            total: number
        }
        switch (data.type) {
            case 1:
             result = await filter.searchLevels("mostdownloaded", data, data.page)
        }

    }
})

export const requestSchema = z.object({
    type: z.coerce.number().optional().default(0),
    page: z.coerce.number().nonnegative().optional().default(0),
    versionGame: z.coerce.number().optional().default(1),
    str: z.string().optional().default("").transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    diff: z.string().nonempty()
        // .regex(/^[\d,-]+$/) // Filter out invalid characters
        .regex(/^(\d(?:,\d)*|-)$/) // x,y,z... or - (empty)
        .optional().transform(
            value => value==="-" ? "" : value
        ),
    demonFilter: z.coerce.number().nonnegative().optional(),
    len: z.string().nonempty()
        .regex(/^(\d(?:,\d)*|-)$/) // x,y,z... or - (empty)
        .optional().transform(
            value => value==="-" ? "" : value
        ),
    uncompleted: z.coerce.number().optional().default(0),
    onlyCompleted: z.coerce.number().optional().default(0),
    completedLevels: z.string().nonempty()
        .regex(/^(\d(?:,\d)*|-)$/) // x,y,z... or - (empty)
        .optional().transform(
            value => value==="-" ? "" : value
        ),
    featured: z.coerce.number().optional().default(0),
    epic: z.coerce.number().optional().default(0),
    mythic: z.coerce.number().optional().default(0),
    legendary: z.coerce.number().optional().default(0),
    original: z.coerce.number().optional().default(0),
    twoPlayer: z.coerce.number().optional().default(0),
    coins: z.coerce.number().optional().default(0),
    star: z.coerce.number().optional().default(0),
    noStar: z.coerce.number().optional().default(0),
    song: z.coerce.number().optional(),
    songCustom: z.coerce.number().optional(),
    gauntlet: z.coerce.number().optional().default(0),
})