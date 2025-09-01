import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {z} from "zod";
import {UserController} from "~~/controller/UserController";
import {ActionController} from "~~/controller/ActionController";

export default defineEventHandler({
    onRequest: [initMiddleware],
    handler: async (event) => {
        const ip = event.context.clientAddress!
        const post = usePostObject<z.infer<typeof requestSchema>>(await readFormData(event))

        const {data, success} = requestSchema.safeParse(post)

        if(!success)
            return "-1"

        const userController = new UserController(event.context.drizzle)
        const {code} = await userController.register({
            username: data.userName,
            password: data.password,
            email: data.email
        }, ip)

        if (code > 0)
            await new ActionController(event.context.drizzle)
                .registerAction("register_user", 0, code, {uname: data.userName, email: data.email})

        return code
    }
})

const requestSchema = z.object({
    userName: z.string().nonempty().transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    password: z.string().nonempty().transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    ),
    email: z.string().nonempty().transform(
        value => useGeometryDashTooling().clearGDRequest(value)
    )
})