import {initMiddleware} from "~/gdps_middleware/init_gdps";
import {authMiddleware} from "~/gdps_middleware/user_auth";
import {z} from "zod";
import {LevelController} from "~~/controller/LevelController";

export default defineEventHandler({
    onRequest: [initMiddleware, authMiddleware],
    handler: async (event) => {
        const post = usePostObject<z.infer<typeof requestSchema>>(await withPreparsedForm(event))
        const {data, success, error} = requestSchema.safeParse(post)
        if (!success) { 
            useLogger().warn(JSON.stringify(z.treeifyError(error)))
            return await event.context.connector.error(-1, "Bad Request")
        }

        const levelController = new LevelController(event.context.drizzle)

        const user = event.context.user!
        user.$.vessels = {
            ...user.$.vessels,
            clr_primary: data.color1,
            clr_secondary: data.color2,
            clr_glow: data.color3,
            cube: data.accIcon,
            ship: data.accShip,
            wave: data.accDart,
            ball: data.accBall,
            ufo: data.accBird,
            robot: data.accRobot,
            spider: data.accSpider,
            swing: data.accSwing,
            jetpack: data.accJetpack,
            trace: data.accGlow,
            death: data.accExplosion,
        }
        user.$.stars = data.stars
        user.$.demons = data.demons
        user.$.diamonds = data.diamonds
        user.$.iconType = data.iconType
        user.$.coins = data.coins
        user.$.userCoins = data.userCoins
        user.$.moons = data.moons
        user.$.special = data.special

        // Please do not ask how or even why this works
        user.$.extraData = {
            demon_stats: {
                ...await levelController.countDemonStats(data.dinfo),
                weekly: data.dinfow,
                gauntlet: data.dinfog,
            },
            standard_stats: {
                daily: data.sinfod,
                gauntlet: data.sinfog,
                auto: data.sinfo[0] || 0,
                easy: data.sinfo[1] || 0,
                normal: data.sinfo[2] || 0,
                hard: data.sinfo[3] || 0,
                harder: data.sinfo[4] || 0,
                insane: data.sinfo[5] || 0,
            },
            platformer_stats: {
                auto: data.sinfo[6] || 0,
                easy: data.sinfo[7] || 0,
                normal: data.sinfo[8] || 0,
                hard: data.sinfo[9] || 0,
                harder: data.sinfo[10] || 0,
                insane: data.sinfo[11] || 0,
            }
        }

        // RobTop issue I guess
        const totalLevels = data.sinfo.reduce((a, b) => a + b, 0)
        if (user.$.demons > totalLevels)
            user.$.extraData.standard_stats.hard = Math.min(user.$.demons - totalLevels, 5)

        await user.commit()
        return await event.context.connector.numberedSuccess(user.$.uid, "User updated")
    }
})

export const requestSchema = z.object({
    color1: z.coerce.number().optional().default(0),
    color2: z.coerce.number().optional().default(0),
    color3: z.coerce.number().optional().default(0),
    stars: z.coerce.number().optional().default(0),
    demons: z.coerce.number().optional().default(0),
    diamonds: z.coerce.number().optional().default(0),
    iconType: z.coerce.number().optional().default(0),
    coins: z.coerce.number().optional().default(0),
    userCoins: z.coerce.number().optional().default(0),
    moons: z.coerce.number().optional().default(0),
    special: z.coerce.number().optional().default(0),
    accIcon: z.coerce.number().optional().default(0),
    accShip: z.coerce.number().optional().default(0),
    accDart: z.coerce.number().optional().default(0),
    accBall: z.coerce.number().optional().default(0),
    accBird: z.coerce.number().optional().default(0),
    accRobot: z.coerce.number().optional().default(0),
    accSpider: z.coerce.number().optional().default(0),
    accSwing: z.coerce.number().optional().default(0),
    accJetpack: z.coerce.number().optional().default(0),
    accGlow: z.coerce.number().optional().default(0),
    accExplosion: z.coerce.number().optional().default(0),
    dinfow: z.coerce.number().optional().default(0),
    dinfog: z.coerce.number().optional().default(0),
    sinfod: z.coerce.number().optional().default(0),
    sinfog: z.coerce.number().optional().default(0),
    dinfo: z.string().optional().default("").transform(
        value => useGeometryDashTooling()
            .clearGDRequest(value)
            .split(",")
            .filter(v=>v.trim()) // Cleans empty values
            .map(v=>parseInt(v))
    ),
    sinfo: z.string().optional().default("").transform(
        value => useGeometryDashTooling()
            .clearGDRequest(value)
            .split(",")
            .filter(v=>v.trim()) // Cleans empty values
            .map(v=>parseInt(v))
    ),
})