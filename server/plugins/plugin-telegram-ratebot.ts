import {ActionHookPayload} from "~~/controller/ActionController";
import {LevelController} from "~~/controller/LevelController";
import type {LevelWithUser} from "~~/controller/Level";
import type {MaybeUndefined} from "~/utils/types";

type TelegramRateBotConfig = {
    botToken: string,
    chatId: number | string,
    disableNotification?: boolean,
    threadId?: number,
    apiBaseUrl?: string
}

type DifficultyDescriptor = {
    name: string,
    stars: number
}

export default defineNitroPlugin((nitro) => {
    nitro.hooks.hook("action:level_rate", async (payload: ActionHookPayload) => {
        try {
            await sendTelegramRateNotification(payload)
        } catch (error) {
            useLogger().warn(`[TelegramRateBot] ${(error as Error).message}`)
        }
    })
})

const sendTelegramRateNotification = async (payload: ActionHookPayload) => {
    const actionType = payload.data?.type || ""
    if (!actionType.startsWith("Rate:"))
        return

    const suffix = actionType.slice(5).toLowerCase()
    if (!suffix || suffix === "reset")
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

    if (!config.ServerConfig.EnableModules?.["telegram_ratebot"])
        return

    const moduleConfig = config.ServerConfig.ModuleConfig?.["telegram_ratebot"] as MaybeUndefined<TelegramRateBotConfig>
    if (!moduleConfig?.botToken || !moduleConfig.chatId)
        return

    const telegramBase = (moduleConfig.apiBaseUrl || "https://api.telegram.org").replace(/\/$/, "")
    const levelController = new LevelController(payload.db)
    const level = await levelController.getOneLevel(payload.targetId)
    if (!level)
        return

    const message = buildTelegramMessage(level.$, {
        moderator: payload.data.uname || `Пользователь #${payload.uid}`,
        serverId: config.ServerConfig.SrvID
    })

    const body: Record<string, unknown> = {
        chat_id: moduleConfig.chatId,
        text: message,
        disable_notification: moduleConfig.disableNotification ?? false,
    }
    if (moduleConfig.threadId)
        body.message_thread_id = moduleConfig.threadId

    try {
        await $fetch(`${telegramBase}/bot${moduleConfig.botToken}/sendMessage`, {
            method: "POST",
            body
        })
    } catch (error) {
        useLogger().error(`[TelegramRateBot] Failed to send message: ${(error as Error).message}`)
    }
}

const buildTelegramMessage = (
    level: LevelWithUser,
    meta: {moderator: string, serverId?: string}
) => {
    const difficulty = describeDifficulty(level.starsGot ?? 0, level.demonDifficulty ?? -1)
    const creator = level.author?.username || `Пользователь #${level.ownerUid}`
    const coins = formatCoins(level.coins ?? 0, level.userCoins ?? 0)
    const feature = level.isFeatured ? "Да" : "Нет"
    const epic = resolveEpic(level.epicness ?? 0)

    const lines = [
        `⭐ Оценка уровня от ${meta.moderator}`,
        `• Название: ${level.name}`,
        `• ID: ${level.id}`,
        `• Автор: ${creator}`,
        `• Сложность: ${difficulty.name}`,
        `• Звёзды: ${difficulty.stars}`,
        `• Фича: ${feature}`,
        ...(epic !== "Нет" ? [`• Эпик: ${epic}`] : []),
        `• Монеты: ${coins}`,
        meta.serverId ? `• Сервер: ${meta.serverId}` : undefined,
    ].filter(Boolean)

    return lines.join("\n")
}

const describeDifficulty = (stars: number, demonDifficulty: number): DifficultyDescriptor => {
    if (!stars)
        return {name: "Без рейтинга", stars: 0}
    if (stars === 1)
        return {name: "Авто", stars}
    if (stars === 2)
        return {name: "Лёгкий", stars}
    if (stars === 3)
        return {name: "Нормальный", stars}
    if (stars === 4 || stars === 5)
        return {name: "Сложный", stars}
    if (stars === 6 || stars === 7)
        return {name: "Очень сложный", stars}
    if (stars === 8 || stars === 9)
        return {name: "Безумный", stars}
    if (stars >= 10)
        return {name: resolveDemonLabel(demonDifficulty), stars}
    return {name: `${stars}★`, stars}
}

const resolveDemonLabel = (value: number) => {
    const map: Record<number, string> = {
        3: "Лёгкий демон",
        4: "Средний демон",
        0: "Сложный демон",
        5: "Безумный демон",
        6: "Экстремальный демон",
    }
    return map[value] || "Безумный демон"
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

const tryGetEvent = () => {
    try {
        return useEvent()
    } catch {
        return undefined
    }
}
