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

const resolveDifficulty = (stars: number, demonDifficulty: number): DifficultyInfo => {
    if (stars === 0) return { label: "Unrated", color: difficultyPalette.unrated }
    if (stars === 1) return { label: "Auto", color: difficultyPalette.auto }
    if (stars <= 3) return { label: "Easy", color: difficultyPalette.easy }
    if (stars <= 6) return { label: "Normal", color: difficultyPalette.normal }
    if (stars <= 8) return { label: "Hard", color: difficultyPalette.hard }
    if (stars === 9) return { label: "Harder", color: difficultyPalette.harder }
    if (stars === 10) {
        if (demonDifficulty === 3) return { label: "Easy Demon", color: difficultyPalette.demon }
        if (demonDifficulty === 4) return { label: "Medium Demon", color: difficultyPalette.demon }
        if (demonDifficulty === 5) return { label: "Hard Demon", color: difficultyPalette.demon }
        if (demonDifficulty === 6) return { label: "Insane Demon", color: difficultyPalette.demon }
        if (demonDifficulty === 7) return { label: "Extreme Demon", color: difficultyPalette.demon }
        return { label: "Demon", color: difficultyPalette.demon }
    }
    return { label: "Insane", color: difficultyPalette.insane }
}

const resolveEpic = (epicness: number): string => {
    if (epicness === 0) return "Not epic"
    if (epicness === 1) return "Epic"
    if (epicness === 2) return "Legendary"
    if (epicness === 3) return "Mythic"
    return `Epic tier ${epicness}`
}

const sendWebhook = async (cfg: DiscordRateBotModuleConfig, level: LevelWithUser, meta: {
    serverId?: string,
    moderator: string,
    actionDescriptor: string
}) => {
    try {
        const webhookBody = createWebhookBody(cfg, level, meta)
        
        await fetch(cfg.webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(webhookBody)
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

    const levelUrl = meta.serverId 
        ? `https://${meta.serverId}.geometrydash.dev/level/${level.id}`
        : `Level ID: ${level.id}`

    return {
        username: cfg.username || "GDPS Rate Bot",
        avatar_url: cfg.avatarUrl,
        content: cfg.mentionRoleId ? `<@&${cfg.mentionRoleId}>` : undefined,
        embeds: [{
            title: `${meta.actionDescriptor}: ${level.name}`,
            color: difficulty.color,
            fields: [
                {
                    name: "Level Info",
                    value: `**Creator:** ${level.user?.username || "Unknown"}\n**Difficulty:** ${difficulty.label}\n**Stars:** ${rating}`,
                    inline: true
                },
                {
                    name: "Status",
                    value: `${featureState}\n${epicTier}`,
                    inline: true
                },
                {
                    name: "Moderator",
                    value: meta.moderator,
                    inline: true
                }
            ],
            description: levelUrl,
            timestamp: new Date().toISOString()
        }]
    }
}

export default definePlugin(() => {
    useSDK().events.onAction("level_rate", async (uid: number, targetId: number, data: ActionData) => {
        const config = useServerConfig()?.modules?.discordRateBot as MaybeUndefined<DiscordRateBotModuleConfig>
        if (!config?.webhookUrl) return

        try {
            const levelController = new LevelController()
            const level = await levelController.getLevelByIdWithUser(targetId)
            if (!level) return

            const actionType = (data as any)?.type as string
            const moderator = (data as any)?.uname as string

            await sendWebhook(config, level, {
                serverId: useServerConfig()?.serverId,
                moderator: moderator || "Unknown",
                actionDescriptor: actionType || "Level rated"
            })
        } catch (error) {
            useLogger().error(`[DiscordRateBot] Error processing level rate: ${(error as Error).message}`)
        }
    })
})