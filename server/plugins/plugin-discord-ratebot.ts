import { LevelController } from "~~/controller/LevelController";
import type { LevelWithUser } from "~~/controller/Level";
import type { MaybeUndefined } from "~/utils/types";
import { ActionData } from "~~/drizzle";

type DiscordRateBotModuleConfig = {
    webhookUrl: string,
    mentionRoleId?: string,
    username?: string,
    avatarUrl?: string
}

type DifficultyInfo = {
    label: string,
    color: number
}

const difficultyPalette: Record<string, number> = {
    unrated: 0x72757a,
    auto: 0x00d1ff,
    easy: 0x3ee45f,
    normal: 0xf7d774,
    hard: 0xffa24c,
    harder: 0xff6b4c,
    insane: 0xc04bff,
    demon: 0x8c2eff
}

export default defineNitroPlugin(() => {
    useSDK().events.onAction("level_rate", async (uid: number, targetId: number, data: ActionData) => {
        try {
            await dispatchDiscordRateWebhook(targetId, uid, data)
        } catch (error) {
            useLogger().warn(`[DiscordRateBot] ${(error as Error).message}`)
        }
    })
})

const dispatchDiscordRateWebhook = async (targetId: number, uid: number, data: ActionData) => {
    const actionType = data.type || ""
    if (!actionType.startsWith("Rate:"))
        return

    const actionSuffix = actionType.slice(5).toLowerCase()
    if (!actionSuffix || actionSuffix === "reset")
        return

    const { config: serverConfig, drizzle } = useEventContext()

    if (!serverConfig.ServerConfig.EnableModules?.["discord_ratebot"])
        return

    const moduleConfig = serverConfig.ServerConfig.ModuleConfig?.["discord_ratebot"] as MaybeUndefined<DiscordRateBotModuleConfig>
    if (!moduleConfig?.webhookUrl)
        return

    if (!moduleConfig.webhookUrl.startsWith("http"))
        throw new Error("Webhook URL must be absolute")

    const levelController = new LevelController(drizzle)
    const level = await levelController.getOneLevel(targetId)
    if (!level)
        return

    const webhookBody = createWebhookBody(
        moduleConfig,
        level.$,
        {
            serverId: serverConfig.ServerConfig.SrvID,
            moderator: data.uname || `User #${uid}`,
            actionDescriptor: actionType
        }
    )

    try {
        await $fetch(moduleConfig.webhookUrl, {
            method: "POST" as any,
            body: webhookBody
        })
    } catch (error) {
        useLogger().error(`[DiscordRateBot] Failed to send webhook: ${(error as Error).message}`)
    }
}

const createWebhookBody = (
    cfg: DiscordRateBotModuleConfig,
    level: LevelWithUser,
    meta: {
        serverId?: string,
        moderator: string,
        actionDescriptor: string
    }
) => {
    const rating = Math.max(level.starsGot ?? 0, 0)
    const difficulty = resolveDifficulty(rating, level.demonDifficulty ?? -1)
    const featureState = level.isFeatured ? "Featured" : "Not featured"
    const epicTier = resolveEpic(level.epicness ?? 0)
    const creator = level.author?.username || `User #${level.ownerUid}`
    const embed = {
        title: `${level.name} • ${difficulty.label}`,
        description: `**${meta.moderator}** rated this level ${rating ? `${rating}★` : "without stars"}.`,
        color: difficulty.color,
        fields: [
            { name: "Level ID", value: level.id.toString(), inline: true },
            { name: "Creator", value: creator, inline: true },
            { name: "Difficulty", value: rating ? `${rating}★ • ${difficulty.label}` : difficulty.label, inline: true },
            { name: "Feature", value: featureState, inline: true },
            { name: "Epic Tier", value: epicTier, inline: true },
            { name: "Coins", value: formatCoins(level.coins ?? 0, level.userCoins ?? 0), inline: true },
            { name: "Server", value: meta.serverId || "Unknown", inline: true },
        ],
        footer: {
            text: `Rated via ${meta.actionDescriptor}`
        },
        timestamp: new Date().toISOString()
    }

    if (!level.isFeatured && epicTier === "None") {
        embed.fields = embed.fields.filter(field => field.name !== "Epic Tier")
    }

    const body: Record<string, unknown> = {
        embeds: [embed]
    }

    if (cfg.mentionRoleId)
        body.content = `<@&${cfg.mentionRoleId}>`
    if (cfg.username)
        body.username = cfg.username
    if (cfg.avatarUrl)
        body.avatar_url = cfg.avatarUrl

    return body
}

const resolveDifficulty = (stars: number, demonDifficulty: number): DifficultyInfo => {
    if (!stars)
        return { label: "Unrated", color: difficultyPalette.unrated }
    if (stars === 1)
        return { label: "Auto", color: difficultyPalette.auto }
    if (stars === 2)
        return { label: "Easy", color: difficultyPalette.easy }
    if (stars === 3)
        return { label: "Normal", color: difficultyPalette.normal }
    if (stars === 4 || stars === 5)
        return { label: "Hard", color: difficultyPalette.hard }
    if (stars === 6 || stars === 7)
        return { label: "Harder", color: difficultyPalette.harder }
    if (stars === 8 || stars === 9)
        return { label: "Insane", color: difficultyPalette.insane }
    if (stars >= 10) {
        const demonLabel = resolveDemon(demonDifficulty)
        return { label: demonLabel, color: difficultyPalette.demon }
    }
    return { label: `${stars}★`, color: difficultyPalette.normal }
}

const resolveDemon = (value: number) => {
    const map: Record<number, string> = {
        3: "Easy Demon",
        4: "Medium Demon",
        0: "Hard Demon",
        5: "Insane Demon",
        6: "Extreme Demon",
    }
    return map[value] || "Insane Demon"
}

const resolveEpic = (value: number) => {
    switch (value) {
        case 1:
            return "Epic"
        case 2:
            return "Legendary"
        case 3:
            return "Mythic"
        default:
            return "None"
    }
}

const formatCoins = (verified: number, userCoins: number) => {
    if (!userCoins)
        return "No user coins"
    if (verified >= userCoins)
        return `${verified} verified coins`
    return `${verified}/${userCoins} verified`
}