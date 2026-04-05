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
 * along with this program.  If not, see <https://www?.gnu.org/licenses/>.
 */

import {ListController} from "~~/controller/ListController";
import {downloadsTable, listsTable, usersTable} from "~~/drizzle";
import {z} from "zod";
import {diff} from "deep-object-diff";
import {eq, sql} from "drizzle-orm";
import {ActionController} from "~~/controller/ActionController";
import type {H3Event} from "nitro/h3";

export type ListType = typeof listsTable.$inferSelect
export type ListWithUser = ListType & {
    author?: Pick<typeof usersTable.$inferSelect, "uid" | "username">
}

export class List<T extends ListType = ListType> {
    private readonly controller: ListController
    private readonly db: Database
    private readonly original: T
    $: T

    constructor(controller: ListController, list: T) {
        this.controller = controller
        this.db = controller.$db
        this.original = structuredClone(list)
        this.$ = list
    }

    isOwnedBy = (uid: number) => this.$.ownerId === uid

    likeList = async (event: H3Event, uid: number, action: "like" | "dislike") => {
        const actionController = new ActionController(this.controller.$db)
        if (await actionController.isItemLiked("list", uid, this.$.id))
            throw new Error("You have already liked/disliked this level")
        if (action === "like") {
            await this.db.update(listsTable)
                .set({likes: sql`${listsTable?.likes}+1`})
                .where(eq(listsTable?.id, this.$.id))
            this.$.likes++
        } else {
            await this.db.update(listsTable)
                .set({likes: sql`${listsTable?.likes}-1`})
                .where(eq(listsTable?.id, this.$.id))
            this.$.likes--
        }
        await actionController.registerAction(event, "like_list", uid, this.$.id, {type: action === "like" ? "Like" : "Dislike"}
        )
    }

    onDownload = async (ip: string) => {
        const verify = await this.db.insert(downloadsTable).values({
            id: -this.$.id,
            ip: ip
        }).onConflictDoNothing().returning()
        if (!verify?.length)
            return
        this.db.update(listsTable)
            .set({downloads: sql`${listsTable?.downloads}+1`})
            .where(eq(listsTable?.id, this.$.id))
    }

    validate = () => {
        const {success} = validateSchema.safeParse(this.$)
        return success
    }

    create = async () => {
        const id = await this.db.insert(listsTable)
            .values(this.$)
            .returning({id: listsTable?.id})
        if (!id[0]?.id) throw new Error("Failed to create list")
        this.$.id = id[0].id
        return this.$.id
    }

    commit = async () => {
        const deltas = diff(this.original, this.$) as typeof listsTable.$inferSelect
        await this.db.update(listsTable)
            .set(deltas)
            .where(eq(listsTable?.id, this.$.id))
    }

    delete = async () => {
        await this.db.delete(listsTable)
            .where(eq(listsTable?.id, this.$.id))
    }

}

const validateSchema = z.object({
    name: z.string().max(32),
    description: z.string().max(512),
    levels: z.array(z.number()).min(1)
})