import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {ListController} from "~~/controller/ListController";

export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success, error} = requestSchema.safeParse(post)
        if (!success) {
            useLogger().warn(JSON.stringify(z.treeifyError(error)))
            return await event.context.connector.error(-1, "Bad Request")
        }

        const listController = new ListController(event.context.drizzle)
        if (data.listID) {
            const list = await listController.getOneList(data.listID)
            if (!list || !list.isOwnedBy(event.context.user!.$.uid))
                return await event.context.connector.error(-1, "You are not the owner of this list")
            list.$.name = data.listName
            list.$.description = data.listDesc
            list.$.levels = data.listLevels
            list.$.difficulty = data.difficulty
            list.$.isUnlisted = data.unlisted
            if (!list.validate())
                return await event.context.connector.error(-1, "Invalid list data")
            await list.commit()
            return await event.context.connector.numberedSuccess(list.$.id, "List updated successfully")
        } else {
            const list = listController.createListObject({
                name: data.listName,
                description: data.listDesc,
                levels: data.listLevels,
                difficulty: data.difficulty,
                isUnlisted: data.unlisted,
                ownerId: event.context.user!.$.uid,
            })
            if (!list.validate())
                return await event.context.connector.error(-1, "Invalid list data")
            return await event.context.connector.numberedSuccess(await list.create(), "List created successfully")
        }
    }
})


export const requestSchema = z.object({
    listID: z.coerce.number().positive().optional(),
    listName: z.string().optional().default("Unnamed").transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    listDesc: z.string().optional().default("").transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    listLevels: z.string().optional().default("").transform(
        value => useGeometryDashTooling()
            .clearGDRequest(value)
            .split(",")
            .filter(v=>v.trim()) // Cleans empty values
            .map(v=>parseInt(v))
    ),
    difficulty: z.coerce.number().optional().default(0),
    listVersion: z.coerce.number().optional().default(0),
    unlisted: z.coerce.number().optional().default(0).transform(
        value => value>0
    ),
})