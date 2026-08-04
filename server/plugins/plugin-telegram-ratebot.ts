import { LevelController } from "~~/controller/LevelController";
import type { LevelWithUser } from "~~/controller/Level";
import type { MaybeUndefined } from "~/utils/types";
import { ActionData } from "~~/drizzle";

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

const maskBotToken = (token: string) => {
    if (!token || token.length <= 8) return "****"
    return `${token.slice(0, 4)}...${token.slice(-4)}`
}

export default defineNitroPlugin(() => {
    useSDK().events.onAction("level_rate", async (uid: number, targetId: number, data: ActionData) => {
        useLogger().info(`[TelegramRateBot] Received level_rate event for level ID ${targetId} by user ID ${uid}. Action data: ${JSON.stringify(data)}`)
        try {
            await sendTelegramRateNotification(targetId, uid, data)
        } catch (error: any) {
            useLogger().warn(`[TelegramRateBot] Error during message dispatch: ${error?.stack || error?.message || error}`)
        }
    })
})

const sendTelegramRateNotification = async (targetId: number, uid: number, data: ActionData) => {
    const actionType = data.type || ""
    if (!actionType.startsWith("Rate:")) {
        useLogger().info(`[TelegramRateBot] Ignored action type '${actionType}' (does not start with 'Rate:')`)
        return
    }

    const suffix = actionType.slice(5).toLowerCase()
    if (!suffix || suffix === "reset") {
        useLogger().info(`[TelegramRateBot] Ignored action suffix '${suffix}'`)
        return
    }

    const { config: serverConfig, drizzle } = useEventContext()

    if (!serverConfig.ServerConfig.EnableModules?.["telegram_ratebot"]) {
        useLogger().info(`[TelegramRateBot] Module 'telegram_ratebot' is disabled in server config`)
        return
    }

    const moduleConfig = serverConfig.ServerConfig.ModuleConfig?.["telegram_ratebot"] as MaybeUndefined<TelegramRateBotConfig>
    if (!moduleConfig?.botToken || !moduleConfig.chatId) {
        useLogger().info(`[TelegramRateBot] botToken or chatId is not configured`)
        return
    }

    const telegramBase = (moduleConfig.apiBaseUrl || "https://api.telegram.org").replace(/\/$/, "")
    const levelController = new LevelController(drizzle)
    const level = await levelController.getOneLevel(targetId)
    if (!level) {
        useLogger().info(`[TelegramRateBot] Level ID ${targetId} not found in database`)
        return
    }

    const message = buildTelegramMessage(level.$, {
        moderator: data.uname || `Пользователь #${uid}`, // data.uname is in ActionData
        serverId: serverConfig.ServerConfig.SrvID
    })

    const body: Record<string, unknown> = {
        chat_id: moduleConfig.chatId,
        text: message,
        disable_notification: moduleConfig.disableNotification ?? false,
    }
    if (moduleConfig.threadId)
        body.message_thread_id = moduleConfig.threadId

    const safeToken = maskBotToken(moduleConfig.botToken)
    useLogger().info(`[TelegramRateBot] Sending rate notification for level ID ${targetId} ('${level.$.name}') to Telegram chat ${moduleConfig.chatId} via bot token ${safeToken}`)
    useLogger().info(`[TelegramRateBot] Request payload: ${JSON.stringify(body)}`)

    try {
        const response = await $fetch.raw(`${telegramBase}/bot${moduleConfig.botToken}/sendMessage`, {
            method: "POST" as any,
            body
        })
        useLogger().info(`[TelegramRateBot] Successfully sent Telegram rate notification for level ID ${targetId}. Response HTTP ${response.status} ${response.statusText}`)
    } catch (error: any) {
        useLogger().error(`[TelegramRateBot] Failed to send Telegram message for level ID ${targetId}: ${error.message}`)
        if (error.response) {
            useLogger().error(`[TelegramRateBot] HTTP Status: ${error.response.status} ${error.response.statusText}`)
            const errData = error.response._data || error.response.data
            useLogger().error(`[TelegramRateBot] Response body: ${typeof errData === 'object' ? JSON.stringify(errData) : errData}`)
        }
        if (error.cause) {
            useLogger().error(`[TelegramRateBot] Cause: ${error.cause}`)
        }
    }
}

const buildTelegramMessage = (
    level: LevelWithUser,
    meta: { moderator: string, serverId?: string }
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
        return { name: "Unrated", stars: 0 }
    if (stars === 1)
        return { name: "Auto", stars }
    if (stars === 2)
        return { name: "Easy", stars }
    if (stars === 3)
        return { name: "Normal", stars }
    if (stars === 4 || stars === 5)
        return { name: "Hard", stars }
    if (stars === 6 || stars === 7)
        return { name: "Harder", stars }
    if (stars === 8 || stars === 9)
        return { name: "Insane", stars }
    if (stars >= 10)
        return { name: resolveDemonLabel(demonDifficulty), stars }

    // Fallback should be theoretically unreachable given the cases above cover 0..inf
    // (ignoring negative numbers which shouldn't exist)
    return { name: "Unknown", stars }
}

const resolveDemonLabel = (value: number) => {
    const map: Record<number, string> = {
        0: "Easy Demon",
        1: "Medium Demon",
        2: "Hard Demon",
        4: "Extreme Demon",
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