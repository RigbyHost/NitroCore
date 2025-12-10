import {ActionHookPayload} from "~~/controller/ActionController";
import {LevelController} from "~~/controller/LevelController";
import type {LevelWithUser} from "~~/controller/Level";
import type {MaybeUndefined} from "~/utils/types";

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

const tryGetEvent = () => {
    try {
        return useEvent()
    } catch {
        return undefined
    }
}

export default defineNitroPlugin((nitro) => {
    nitro.hooks.hook("action:level_rate", async (payload: ActionHookPayload) => {
        try {
            await dispatchDiscordRateWebhook(payload)
        } catch (error) {
            useLogger().warn(`[DiscordRateBot] ${(error as Error).message}`)
        }
    })
})

const dispatchDiscordRateWebhook = async (payload: ActionHookPayload) => {
    const actionType = payload.data?.type || ""
    if (!actionType.startsWith("Rate:"))
        return

    const actionSuffix = actionType.slice(5).toLowerCase()
    if (!actionSuffix || actionSuffix === "reset")
        return

    const event = tryGetEvent()
    const srvid =
        payload.srvid
        || event?.context.config?.config?.ServerConfig.SrvID
        || (event ? getRouterParam(event, "srvid") : undefined)

    const config =
        event?.context.config?.config
        ?? (srvid ? (await useServerConfig(srvid)).config : null)
    if (!config)
        return

    if (!config.ServerConfig.EnableModules?.["discord_ratebot"])
        return

    const moduleConfig = config.ServerConfig.ModuleConfig?.["discord_ratebot"] as MaybeUndefined<DiscordRateBotModuleConfig>
    if (!moduleConfig?.webhookUrl)
        return

    if (!moduleConfig.webhookUrl.startsWith("http"))
        throw new Error("Webhook URL must be absolute")

    const levelController = new LevelController(payload.db)
    const level = await levelController.getOneLevel(payload.targetId)
    if (!level)
        return

    const webhookBody = createWebhookBody(
        moduleConfig,
        level.$,
        {
            serverId: config.ServerConfig.SrvID,
            moderator: payload.data.uname || `User #${payload.uid}`,
            actionDescriptor: actionType
        }
    )

    try {
        await $fetch(moduleConfig.webhookUrl, {
            method: "POST",
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
    const featureState = level.isFeatured ? "Да" : "Нет"
    const epicTier = resolveEpic(level.epicness ?? 0)
    const creator = level.author?.username || `Пользователь #${level.ownerUid}`
    const actionLabel = translateAction(meta.actionDescriptor)
    const embed = {
        title: `${level.name} • ${difficulty.label}`,
        description: `**${meta.moderator}** обновил оценку уровня ${rating ? `до ${rating}★` : "без звёзд"}.`,
        color: difficulty.color,
        fields: [
            {name: "ID уровня", value: level.id.toString(), inline: true},
            {name: "Автор", value: creator, inline: true},
            {name: "Сложность", value: rating ? `${rating}★ • ${difficulty.label}` : difficulty.label, inline: true},
            {name: "Фича", value: featureState, inline: true},
            {name: "Эпик", value: epicTier, inline: true},
            {name: "Монеты", value: formatCoins(level.coins ?? 0, level.userCoins ?? 0), inline: true},
            {name: "Сервер", value: meta.serverId || "Неизвестно", inline: true},
        ],
        footer: {
            text: `Действие: ${actionLabel}`
        },
        timestamp: new Date().toISOString()
    }

    if (!level.isFeatured && epicTier === "Нет") {
        embed.fields = embed.fields.filter(field => field.name !== "Эпик")
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
        return {label: "Unrated", color: difficultyPalette.unrated}
    if (stars === 1)
        return {label: "Auto", color: difficultyPalette.auto}
    if (stars === 2)
        return {label: "Easy", color: difficultyPalette.easy}
    if (stars === 3)
        return {label: "Normal", color: difficultyPalette.normal}
    if (stars === 4 || stars === 5)
        return {label: "Hard", color: difficultyPalette.hard}
    if (stars === 6 || stars === 7)
        return {label: "Harder", color: difficultyPalette.harder}
    if (stars === 8 || stars === 9)
        return {label: "Insane", color: difficultyPalette.insane}
    if (stars >= 10) {
        const demonLabel = resolveDemon(demonDifficulty)
        return {label: demonLabel, color: difficultyPalette.demon}
    }
    return {label: `${stars}★`, color: difficultyPalette.normal}
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
            return "Эпик"
        case 2:
            return "Легендарный"
        case 3:
            return "Мифический"
        default:
            return "Нет"
    }
}

const formatCoins = (verified: number, userCoins: number) => {
    if (!userCoins)
        return "Нет пользовательских монет"
    if (verified >= userCoins)
        return `${userCoins}/${userCoins} подтверждены`
    return `${verified}/${userCoins} подтверждены`
}

const translateAction = (action: string) => {
    if (!action.startsWith("Rate:"))
        return action
    const suffix = action.slice(5).toLowerCase()
    const map: Record<string, string> = {
        reset: "Сброс рейтинга",
        feature: "Выдача фичи",
        unfeature: "Снятие фичи",
        epic: "Выдача эпика",
        legendary: "Выдача легендарного",
        mythic: "Выдача мифического",
        unepic: "Снятие эпика",
        auto: "Уровень отмечен как Авто",
        easy: "Выставлен лёгкий уровень",
        normal: "Выставлен нормальный уровень",
        hard: "Выставлен сложный уровень",
        harder: "Выставлен очень сложный уровень",
        insane: "Выставлен безумный уровень"
    }
    if (map[suffix])
        return map[suffix]
    if (!Number.isNaN(Number(suffix)))
        return `Выставлено ${suffix}★`
    return action
}
