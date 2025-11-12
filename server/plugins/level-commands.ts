import {ActionController} from "~~/controller/ActionController";
import {questsTable} from "~~/drizzle";
import {and, eq} from "drizzle-orm";
import {LevelController} from "~~/controller/LevelController";

export default defineNitroPlugin(() => {
    const csdk = useSDK().commands

    csdk.register(
        "level", "feature",
        async (args: string[]) => {
            const ctx = useCommandContext()
            ctx.level!.featureLevel(true)
            await ctx.level!.commit()
            await new LevelController(ctx.drizzle).recalculateCreatorPoints(ctx.level!.$.ownerUid)

            await new ActionController(ctx.drizzle)
                .registerAction("level_rate", ctx.user!.$.uid, ctx.level!.$.id, {
                    uname: ctx.user!.$.username,
                    type: "Feature"
                })
        },
        {cFeature: true}
    )

    csdk.register(
        "level", "unfeature",
        async (args: string[]) => {
            const ctx = useCommandContext()
            ctx.level!.featureLevel(false)
            await ctx.level!.commit()
            await new LevelController(ctx.drizzle).recalculateCreatorPoints(ctx.level!.$.ownerUid)

            await new ActionController(ctx.drizzle)
                .registerAction("level_rate", ctx.user!.$.uid, ctx.level!.$.id, {
                    uname: ctx.user!.$.username,
                    type: "Unfeature"
                })
        },
        {cFeature: true}
    )

    csdk.register(
        "level", "epic",
        async (args: string[]) => {
            const ctx = useCommandContext()
            ctx.level!.featureLevel(true)
            ctx.level!.epicLevel("epic")
            await ctx.level!.commit()
            await new LevelController(ctx.drizzle).recalculateCreatorPoints(ctx.level!.$.ownerUid)

            await new ActionController(ctx.drizzle)
                .registerAction("level_rate", ctx.user!.$.uid, ctx.level!.$.id, {
                    uname: ctx.user!.$.username,
                    type: "Epic"
                })
        },
        {cEpic: true}
    )

    csdk.register(
        "level", "legendary",
        async (args: string[]) => {
            const ctx = useCommandContext()
            ctx.level!.featureLevel(true)
            ctx.level!.epicLevel("legendary")
            await ctx.level!.commit()
            await new LevelController(ctx.drizzle).recalculateCreatorPoints(ctx.level!.$.ownerUid)

            await new ActionController(ctx.drizzle)
                .registerAction("level_rate", ctx.user!.$.uid, ctx.level!.$.id, {
                    uname: ctx.user!.$.username,
                    type: "Legendary"
                })
        },
        {cEpic: true}
    )

    csdk.register(
        "level", "mythic",
        async (args: string[]) => {
            const ctx = useCommandContext()
            ctx.level!.featureLevel(true)
            ctx.level!.epicLevel("mythic")
            await ctx.level!.commit()
            await new LevelController(ctx.drizzle).recalculateCreatorPoints(ctx.level!.$.ownerUid)

            await new ActionController(ctx.drizzle)
                .registerAction("level_rate", ctx.user!.$.uid, ctx.level!.$.id, {
                    uname: ctx.user!.$.username,
                    type: "Mythic"
                })
        },
        {cEpic: true}
    )

    csdk.register(
        "level", "unepic",
        async (args: string[]) => {
            const ctx = useCommandContext()
            ctx.level!.epicLevel("unepic")
            ctx.level!.featureLevel(false)
            await ctx.level!.commit()
            await new LevelController(ctx.drizzle).recalculateCreatorPoints(ctx.level!.$.ownerUid)

            await new ActionController(ctx.drizzle)
                .registerAction("level_rate", ctx.user!.$.uid, ctx.level!.$.id, {
                    uname: ctx.user!.$.username,
                    type: "Unepic"
                })
        },
        {cEpic: true}
    )

    csdk.register(
        "level", "coins",
        async (args: string[]) => {
            const ctx = useCommandContext()
            if (args.length < 1 || !["verify", "reset"].includes(args[0]))
                throw new Error("Specify 'verify' or 'reset' argument. Usage: !coins <verify/reset>")
            if (args[0] === "verify") {
                ctx.level!.verifyCoins(true)
                await new ActionController(ctx.drizzle)
                    .registerAction("level_rate", ctx.user!.$.uid, ctx.level!.$.id, {
                        uname: ctx.user!.$.username,
                        type: "Coins:Verify"
                    })
            } else {
                ctx.level!.verifyCoins(false)
                await new ActionController(ctx.drizzle)
                    .registerAction("level_rate", ctx.user!.$.uid, ctx.level!.$.id, {
                        uname: ctx.user!.$.username,
                        type: "Coins:Reset"
                    })
            }
            await ctx.level!.commit()
        },
        {cVerCoins: true}
    )

    csdk.register(
        "level", "daily",
        async (args: string[]) => {
            const ctx = useCommandContext()

            let date: Date | undefined
            if (args.length) {
                if (!["reset", "queue"].includes(args[0]))
                    throw new Error("Invalid argument. Usage: !daily [reset/queue]")

                if (args[0] === "reset") {
                    await ctx.drizzle.delete(questsTable).where(and(
                        eq(questsTable.levelId, ctx.level!.$.id),
                        eq(questsTable.type, "daily")
                    ))
                    await new ActionController(ctx.drizzle)
                        .registerAction("level_rate", ctx.user!.$.uid, ctx.level!.$.id, {
                            uname: ctx.user!.$.username,
                            type: "Daily:Reset"
                        })
                    return
                }
                if (args[0] === "queue") {
                    const res = await ctx.drizzle.query.questsTable.findFirst({
                        columns: {timeAdded: true},
                        where: (q, {eq}) => eq(q.type, "daily"),
                        orderBy: (q, {desc}) => desc(q.timeAdded),
                    })
                    if (res) {
                        date = res.timeAdded
                        date.setHours(0, 0, 0, 0)
                        date.setDate(date.getDate() + 1)
                    }
                }
            }

            ctx.drizzle.insert(questsTable).values({
                type: "daily",
                levelId: ctx.level!.$.id,
                timeAdded: date,
            })

            await new ActionController(ctx.drizzle)
                .registerAction("level_rate", ctx.user!.$.uid, ctx.level!.$.id, {
                    uname: ctx.user!.$.username,
                    type: "Daily:Publish"
                })
        },
        {cDaily: true}
    )

    csdk.register(
        "level", "weekly",
        async (args: string[]) => {
            const ctx = useCommandContext()

            let date: Date | undefined
            if (args.length) {
                if (!["reset", "queue"].includes(args[0]))
                    throw new Error("Invalid argument. Usage: !weekly [reset/queue]")

                if (args[0] === "reset") {
                    await ctx.drizzle.delete(questsTable).where(and(
                        eq(questsTable.levelId, ctx.level!.$.id),
                        eq(questsTable.type, "weekly")
                    ))
                    await new ActionController(ctx.drizzle)
                        .registerAction("level_rate", ctx.user!.$.uid, ctx.level!.$.id, {
                            uname: ctx.user!.$.username,
                            type: "Weekly:Reset"
                        })
                    return
                }
                if (args[0] === "queue") {
                    const res = await ctx.drizzle.query.questsTable.findFirst({
                        columns: {timeAdded: true},
                        where: (q, {eq}) => eq(q.type, "weekly"),
                        orderBy: (q, {desc}) => desc(q.timeAdded),
                    })
                    if (res) {
                        date = res.timeAdded
                        date.setHours(0, 0, 0, 0)
                        date.setDate(date.getDate() + 7)
                    }
                }
            }

            ctx.drizzle.insert(questsTable).values({
                type: "weekly",
                levelId: ctx.level!.$.id,
                timeAdded: date,
            })

            await new ActionController(ctx.drizzle)
                .registerAction("level_rate", ctx.user!.$.uid, ctx.level!.$.id, {
                    uname: ctx.user!.$.username,
                    type: "Weekly:Publish"
                })
        },
        {cDaily: true}
    )

    csdk.register(
        "level", "rate",
        async (args: string[]) => {
            const ctx = useCommandContext()

            if (!args.length || !["auto", "easy", "normal", "hard", "harder", "insane", "reset"].includes(args[0]))
                throw new Error("Specify difficulty argument (auto, easy, normal, hard, harder, insane, reset)")
            if (args[0] === "reset") {
                ctx.level!.rateLevel(0)
                await ctx.level!.commit()
                await new ActionController(ctx.drizzle)
                    .registerAction("level_rate", ctx.user!.$.uid, ctx.level!.$.id, {
                        uname: ctx.user!.$.username,
                        type: "Rate:Reset"
                    })
                return
            }
            const exstars = ctx.level!.$.starsGot
            ctx.level!.rateLevel({
                auto: 1, easy: 2, normal: 3, hard: 4, harder: 6, insane: 8,
            }[args[0]]!)
            ctx.level!.$.starsGot = exstars
            await ctx.level!.commit()
            await new ActionController(ctx.drizzle)
                .registerAction("level_rate", ctx.user!.$.uid, ctx.level!.$.id, {
                    uname: ctx.user!.$.username,
                    type: `Rate:${args[0].toUpperCase()[0]+args[0].slice(1)}`
                })
        },
        {cRate: true}
    )

    // TODO: lvl, song
})