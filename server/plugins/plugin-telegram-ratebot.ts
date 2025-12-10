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

export default defineNitroPlugin(() => {
    useSDK().events.onAction("level_rate", async (uid: number, targetId: number, data: ActionData) => {
        try {
            await sendTelegramRateNotification(targetId, uid, data)
        } catch (error) {
            useLogger().warn(`[TelegramRateBot] ${(error as Error).message}`)
        }
    })
})

const sendTelegramRateNotification = async (targetId: number, uid: number, data: ActionData) => {
    const actionType = data.type || ""
    if (!actionType.startsWith("Rate:"))
        return

    const suffix = actionType.slice(5).toLowerCase()
    if (!suffix || suffix === "reset")
        return

    const { config: serverConfig, drizzle } = useEventContext()

    if (!serverConfig.ServerConfig.EnableModules?.["telegram_ratebot"])
        return

    const moduleConfig = serverConfig.ServerConfig.ModuleConfig?.["telegram_ratebot"] as MaybeUndefined<TelegramRateBotConfig>
    if (!moduleConfig?.botToken || !moduleConfig.chatId)
        return

    const telegramBase = (moduleConfig.apiBaseUrl || "https://api.telegram.org").replace(/\/$/, "")
    const levelController = new LevelController(drizzle)
    const level = await levelController.getOneLevel(targetId)
    if (!level)
        return

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

    try {
        await $fetch(`${telegramBase}/bot${moduleConfig.botToken}/sendMessage`, {
            method: "POST" as any,
            body
        })
    } catch (error) {
        useLogger().error(`[TelegramRateBot] Failed to send message: ${(error as Error).message}`)
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