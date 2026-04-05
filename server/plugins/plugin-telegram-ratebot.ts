/**
 * NitroCore - GDPS (Geometry Dash Private Server) implementation
 * Copyright (C) 2025 M41den <https://m41den.dev> and Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { definePlugin } from "nitro";
import { LevelController } from "~~/controller/LevelController";
import type { LevelWithUser } from "~~/controller/Level";
import type { MaybeUndefined } from "~/utils/types";
import type { ActionData } from "~~/drizzle";
import { useEventContext } from "~~/sdk/events/context";

type TelegramRateBotModuleConfig = {
    botToken: string,
    chatId: string,
    threadId?: string
}

const resolveDifficulty = (stars: number, demonDifficulty: number): string => {
    if (stars === 0) return "⚪ Unrated"
    if (stars === 1) return "🔵 Auto"
    if (stars <= 3) return "🟢 Easy"
    if (stars <= 6) return "🟡 Normal"
    if (stars <= 8) return "🟠 Hard"
    if (stars === 9) return "🔴 Harder"
    if (stars === 10) {
        if (demonDifficulty === 3) return "👹 Easy Demon"
        if (demonDifficulty === 4) return "👹 Medium Demon"
        if (demonDifficulty === 5) return "👹 Hard Demon"
        if (demonDifficulty === 6) return "👹 Insane Demon"
        if (demonDifficulty === 7) return "👹 Extreme Demon"
        return "👹 Demon"
    }
    return "🟣 Insane"
}

const resolveEpic = (epicness: number): string => {
    if (epicness === 0) return "❌ Not epic"
    if (epicness === 1) return "⭐ Epic"
    if (epicness === 2) return "🏆 Legendary"
    if (epicness === 3) return "💎 Mythic"
    return `⭐ Epic tier ${epicness}`
}

const sendTelegramMessage = async (cfg: TelegramRateBotModuleConfig, level: LevelWithUser, meta: {
    serverId?: string,
    moderator: string,
    actionDescriptor: string
}) => {
    try {
        const message = createTelegramMessage(level, meta)
        
        const url = `https://api.telegram.org/bot${cfg.botToken}/sendMessage`
        const params = new URLSearchParams({
            chat_id: cfg.chatId,
            text: message,
            parse_mode: "HTML",
            disable_web_page_preview: "true"
        })

        if (cfg.threadId) {
            params.append("message_thread_id", cfg.threadId)
        }

        await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
        })
    } catch (error) {
        useLogger().error(`[TelegramRateBot] Failed to send message: ${(error as Error).message}`)
    }
}

const createTelegramMessage = (level: LevelWithUser, meta: {
    serverId?: string,
    moderator: string,
    actionDescriptor: string
}): string => {
    const rating = Math.max(level.starsGot ?? 0, 0)
    const difficulty = resolveDifficulty(rating, level.demonDifficulty ?? -1)
    const featureState = level.isFeatured ? "✅ Featured" : "❌ Not featured"
    const epicTier = resolveEpic(level.epicness ?? 0)

    const levelUrl = meta.serverId 
        ? `https://${meta.serverId}.geometrydash.dev/level/${level.id}`
        : `Level ID: ${level.id}`

    return `
🎮 <b>${meta.actionDescriptor}: ${level.name}</b>

👤 <b>Creator:</b> ${level.author?.username || "Unknown"}
${difficulty} (<b>${rating}</b> ⭐)

${featureState}
${epicTier}

👮‍♂️ <b>Moderator:</b> ${meta.moderator}

🔗 ${levelUrl}
    `.trim()
}

export default definePlugin(() => {
    useSDK().events.onAction("level_rate", async (uid: number, targetId: number, data: ActionData) => {
        const context = useEventContext()
        const config = (context.config as any)?.modules?.telegramRateBot as MaybeUndefined<TelegramRateBotModuleConfig>
        if (!config?.botToken || !config?.chatId) return

        try {
            const levelController = new LevelController(context.drizzle)
            const level = await levelController.getOneLevel(targetId, true)
            if (!level) return

            const actionType = (data as any)?.type as string
            const moderator = (data as any)?.uname as string

            await sendTelegramMessage(config, level.$, {
                serverId: (context.config as any)?.ServerConfig?.SrvID,
                moderator: moderator || "Unknown",
                actionDescriptor: actionType || "Level rated"
            })
        } catch (error) {
            useLogger().error(`[TelegramRateBot] Error processing level rate: ${(error as Error).message}`)
        }
    })
})
