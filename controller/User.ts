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

import {type Database} from "~/utils/useDrizzle";
import {rolesTable, usersTable} from "~~/drizzle";
import {diff} from "deep-object-diff";
import {and, eq, gte, sql} from "drizzle-orm";
import {UserController} from "~~/controller/UserController";

export type UserType = typeof usersTable.$inferSelect
export type UserWithRole = UserType & {
    role?: typeof rolesTable.$inferSelect
}
/**
 * User CRUD wrapper
 *
 * @class User
 */
export class User<T extends UserType = UserType> {
    private readonly controller: UserController
    private readonly db: Database
    private readonly original: T
    $: T

    /**
     * @internal Should be always created thorugh {@link UserController}
     * @param controller UserController instance
     * @param user Drizzle User data
     */
    constructor(controller: UserController, user: T) {
        this.db = controller.$db
        this.controller = controller
        this.original = structuredClone(user)
        this.$ = user
    }

    fetchRole = async () => {
        if (!this.$.roleId)
            return null
        const role = await this.db.query?.rolesTable.findFirst({
            where: (role, {eq}) => eq(role?.id, this.$.roleId)
        });
        return role || null
    }

    /**
     * Saves all changes to the database, should always be called after modifying the user
     */
    commit = async () => {
        const deltas = diff(this.original, this.$) as typeof usersTable.$inferSelect
        if (deltas?.extraData)
            deltas.extraData = this.$.extraData
        if (deltas?.protectMeta)
            deltas.protectMeta = this.$.protectMeta
        if (deltas?.vessels)
            deltas.vessels = this.$.vessels
        if (deltas?.chests)
            deltas.chests = this.$.chests
        if (deltas?.settings)
            deltas.settings = this.$.settings
        if (deltas?.friendshipIds)
            deltas.friendshipIds = this.$.friendshipIds
        if (deltas?.blacklistedUsers)
            deltas.blacklistedUsers = this.$.blacklistedUsers

        await this.db.update(usersTable)
            .set({
                ...deltas,
                accessDate: sql`CURRENT_TIMESTAMP`
            })
            .where(eq(usersTable?.uid, this.$.uid))
    }

    blacklist = {
        add: (uid: number) => {
            if (!this.$.blacklistedUsers)
                this.$.blacklistedUsers=[]
            if (!this.$.blacklistedUsers.includes(uid))
                this.$.blacklistedUsers.push(uid)
        },
        remove: (uid: number) => {
            if (!this.$.blacklistedUsers)
                this.$.blacklistedUsers=[]
            this.$.blacklistedUsers = this.$.blacklistedUsers.filter(uid => uid !== uid)
        }
    }

    friendships = {
        add: (friendshipId: number) => {
            if (!this.$.friendshipIds)
                this.$.friendshipIds=[]
            if (!this.$.friendshipIds.includes(friendshipId)) {
                this.$.friendshipIds.push(friendshipId)
                this.$.friendsCount++
            }
        },
        remove: (friendshipId: number) => {
            if (!this.$.friendshipIds)
                this.$.friendshipIds=[]
            if (this.$.friendshipIds.includes(friendshipId)) {
                this.$.friendshipIds = this.$.friendshipIds.filter(fid => fid !== friendshipId)
                this.$.friendsCount--
            }
        }
    }

    bans = {
        banUser: () => {
            this.$.isBanned = 2
        },
        unbanUser: () => {
            this.$.isBanned = 0
        }
    }

    getShownIcon = () => {
        switch (this.$.iconType) {
            case 1:
                return this.$.vessels.ship
            case 2:
                return this.$.vessels.ball
            case 3:
                return this.$.vessels.ufo
            case 4:
                return this.$.vessels.wave
            case 5:
                return this.$.vessels.robot
            case 6:
                return this.$.vessels.spider
            case 7:
                return this.$.vessels.swing
            default:
                return this.$.vessels?.cube
        }
    }

    getLeaderboardRank = async () => this.db.$count(
        usersTable,
        and(
            gte(usersTable?.stars, this.$.stars),
            eq(usersTable?.isBanned, 0)
        )
    )
}