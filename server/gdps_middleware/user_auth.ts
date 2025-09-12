import {UserController} from "~~/controller/UserController";
import {z} from "zod";
import {User} from "~~/controller/User";

export const authMiddleware = defineEventHandler(async event => {
    const userCtx = new UserController(event.context.drizzle!)
    const user = await userCtx.performGJPAuth()
    if (!user)
        return await event.context.connector.error(-2, "Invalid credentials")
    event.context.user = user
})

export const authLoginMiddleware = defineEventHandler(async event => {
    const userController = new UserController(event.context.drizzle)
    const post = usePostObject<z.infer<typeof authRequestSchema>>(await readFormData(event))
    const {data, success} = authRequestSchema.safeParse(post)

    if (!success)
        return await event.context.connector.error(-1, "Bad request")

    let user: Nullable<User> = null

    if (data.gameVersion === "2.2") {
        user = await userController.performGJPAuth()
    } else {
        const uid = await userController.logIn(
            data.userName,
            data.password,
            event.context.clientAddress!,
        ).then(c => c.code)
        if (uid > 0)
            user = await userController.getOneUser({uid})
    }

    if (!user)
        return await event.context.connector.error(-2, "Invalid credentials")

    event.context.user = user
})

export const authRequestSchema = z.object({
    userName: z.string().nonempty().optional().default("").transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    password: z.string().nonempty().optional().default("").transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    gameVersion: z.string().nonempty().optional().default("21"),
})