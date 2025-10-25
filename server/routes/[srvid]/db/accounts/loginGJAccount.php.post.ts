import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {z} from "zod";
import {UserController} from "~~/controller/UserController";
import {ActionController} from "~~/controller/ActionController";

export default defineEventHandler({
    onRequest: [initMiddleware],
    handler: async (event) => {
        const ip = event.context.clientAddress!
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))

        const {data, success} = requestSchema.safeParse(post)

        if(!success)
            return await event.context.connector.error(-1, "Bad request")

        const userController = new UserController(event.context.drizzle)

        let uid: number
        if (data.gjp2)
            uid = await userController.logIn22(data.userName, data.gjp2, ip).then(c=>c.code)
        else
            uid = await userController.logIn(data.userName, data.password!, ip).then(c=>c.code)

        if (uid > 0) {
            await event.context.connector.account.login(uid)
            await new ActionController(event.context.drizzle)
                .registerAction("login_user", 0, uid, {uname: data.userName})

        } else {
            return await event.context.connector.error(uid, "Invalid credentials")
        }
    }
})

export const requestSchema = z.object({
    userName: z.string().nonempty().transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    password: z.string().nonempty().transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ).optional(),
    gjp2: z.string().nonempty().transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ).optional()
}).check(
    ctx => {
        if(!ctx.value.password && !ctx.value.gjp2)
            ctx.issues.push({
                code: "custom",
                message: "Password or GJP2 is required",
                input: ctx.value
            })
    }
)