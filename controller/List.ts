import {ListController} from "~~/controller/ListController";
import {listsTable} from "~~/drizzle";
import {z} from "zod";
import {diff} from "deep-object-diff";
import {eq, sql} from "drizzle-orm";
import {ActionController} from "~~/controller/ActionController";

type ListType = typeof listsTable.$inferSelect

export class List<T extends ListType = ListType> {
    private readonly controller: ListController
    private readonly db: Database
    private readonly original: T
    $: T

    constructor(controller: ListController, list: T) {
        this.controller = controller
        this.db = controller.$db
        this.original = list
        this.$ = list
    }

    isOwnedBy = (uid: number) => this.$.ownerId === uid

    likeList = async (uid: number, action: "like" | "dislike") => {
        const actionController = new ActionController(this.controller.$db)
        if (await actionController.isItemLiked("list", uid, this.$.id))
            throw new Error("You have already liked/disliked this level")
        if (action === "like") {
            await this.db.update(listsTable)
                .set({likes: sql`${listsTable.likes}+1`})
                .where(eq(listsTable.id, this.$.id))
            this.$.likes++
        } else {
            await this.db.update(listsTable)
                .set({likes: sql`${listsTable.likes}-1`})
                .where(eq(listsTable.id, this.$.id))
            this.$.likes--
        }
        await actionController.registerAction(
            "like_list",
            uid,
            this.$.id,
            {type: action === "like" ? "Like" : "Dislike"}
        )
    }

    onDownload = async () =>
        this.db.update(listsTable)
            .set({downloads: sql`${listsTable.downloads}+1`})
            .where(eq(listsTable.id, this.$.id))

    validate = () => {
        const {success} = validateSchema.safeParse(this.$)
        return success
    }

    create = async () => {
        const id = await this.db.insert(listsTable)
            .values(this.$)
            .returning({id: listsTable.id})
        this.$.id = id[0].id
        return this.$.id
    }

    commit = async () => {
        const deltas = diff(this.original, this.$) as typeof listsTable.$inferSelect
        await this.db.update(listsTable)
            .set(deltas)
            .where(eq(listsTable.id, this.$.id))
    }

    delete = async () => {
        await this.db.delete(listsTable)
            .where(eq(listsTable.id, this.$.id))
    }

}

const validateSchema = z.object({
    name: z.string().max(32),
    description: z.string().max(512),
    levels: z.array(z.number()).min(1)
})