import {LevelController} from "~~/controller/LevelController";
import {commentsTable, levelsTable, rateQueueTable, usersTable} from "~~/drizzle";
import {diff} from "deep-object-diff";
import {and, eq, sql} from "drizzle-orm";
import {MakeOptional} from "~/utils/types";
import {z} from "zod";
import {ActionController} from "~~/controller/ActionController";

export type LevelType = MakeOptional<typeof levelsTable.$inferSelect, "stringLevel">
export type LevelWithUser = LevelType & {
    author?: Pick<typeof usersTable.$inferSelect, "uid" | "username">
}

export class Level<T extends LevelType = LevelType> {
    private readonly controller: LevelController
    private readonly db: Database
    private readonly original: T
    $: T

    constructor(controller: LevelController, level: T) {
        this.db = controller.$db
        this.controller = controller
        this.original = level
        this.$ = level
    }

    isOwnedBy = (uid: number) => this.$.ownerUid === uid

    suggestDifficulty = (difficulty: number) => {
        this.$.suggestedDifficulty = (this.$.suggestedDifficulty*this.$.suggestedDifficultyCount + difficulty)
            / ++this.$.suggestedDifficultyCount // Pre-increment
    }

    rateLevel = (stars: number) => {
        this.$.starsGot = stars
        this.$.demonDifficulty = -1
        switch (stars) {
            case 1:
                this.$.difficulty = -1 // Auto
                break
            case 2:
                this.$.difficulty = 10 // Easy
                break
            case 3:
                this.$.difficulty = 20 // Normal
                break
            case 4:
            case 5:
                this.$.difficulty = 30 // Hard
                break
            case 6:
            case 7:
                this.$.difficulty = 40 // Harder
                break
            case 8:
            case 9:
                this.$.difficulty = 50 // Insane
                break
            case 10:
                this.$.difficulty = 50 // Demon
                this.$.demonDifficulty = 3
                break
            default:
                this.$.difficulty = 0 // Unrated (N/A)
        }
    }

    rateDemon = (difficulty: number) => {
        this.$.difficulty = 50
        switch (difficulty) {
            case 5:
                this.$.demonDifficulty = 6
                break
            case 4:
                this.$.demonDifficulty = 5
                break
            case 3:
                this.$.demonDifficulty = 0
                break
            case 2:
                this.$.demonDifficulty = 4
                break
            default:
                this.$.demonDifficulty = 3
        }
    }

    featureLevel = (feature: boolean) => {
        if (!feature && this.$.epicness)
            throw new Error("This level has Epic, cannot unrate")
        this.$.isFeatured = feature
    }

    epicLevel = (type: "unepic" | "epic" | "legendary" | "mythic") => {
        const variative = ["unepic", "epic", "legendary", "mythic"]
        this.$.epicness = variative.indexOf(type)
    }

    likeLevel = async (uid: number, action: "like" | "dislike") => {
        const actionController = new ActionController(this.db)
        if (await actionController.isItemLiked("level", uid, this.$.id))
            throw new Error("You have already liked/disliked this level")
        if (action === "like") {
            await this.db.update(levelsTable)
                .set({likes: sql`${levelsTable.likes}+1`})
                .where(eq(levelsTable.id, this.$.id))
            this.$.likes++
        } else {
            await this.db.update(levelsTable)
                .set({likes: sql`${levelsTable.likes}-1`})
                .where(eq(levelsTable.id, this.$.id))
            this.$.likes--
        }
        await actionController.registerAction(
            "like_level",
            uid,
            this.$.id,
            {type: action === "like" ? "Like" : "Dislike"}
        )
    }

    verifyCoins = (verify: boolean) => {
        if (verify)
            this.$.coins = this.$.userCoins
        else
            this.$.coins = 0
    }

    reportLevel = () => {
        // FIXME: Not CRUD - should use TX or commit relative reports+1 immediately
        // TODO: Implement reports logging to avoid spam
        this.$.reports++
    }

    requestRateByModerator = async (modUid: number, stars: number, featured: boolean) => {
        const cnt = await this.db.$count(rateQueueTable, and(
            eq(rateQueueTable.modUid, modUid),
            eq(rateQueueTable.levelId, stars),
        ))
        if (cnt > 0)
            throw new Error("You have already requested a rating for this level")
        await this.db.insert(rateQueueTable).values({
            uid: this.$.ownerUid,
            modUid: modUid,
            levelId: this.$.id,
            name: this.$.name,
            stars: stars,
            isFeatured: featured,
        })
    }

    onDownload = async () =>
        this.db.update(levelsTable)
            .set({downloads: sql`${levelsTable.downloads}+1`})
            .where(eq(levelsTable.id, this.$.id))

    validate = () => {
        const {success} = validateSchema.safeParse(this.$)
        return success
    }

    create = async () => {
        const id = await this.db.insert(levelsTable)
            .values(this.$ as typeof levelsTable.$inferInsert)
            .returning({id: levelsTable.id})
        this.$.id = id[0].id
        return this.$.id
    }

    commit = async () => {
        const deltas = diff(this.original, this.$) as typeof levelsTable.$inferSelect
        await this.db.update(levelsTable)
            .set(deltas)
            .where(eq(levelsTable.id, this.$.id))
    }

    delete = async () => {
        // TODO: Implement relations for CASCADE delete
        await this.db.delete(levelsTable)
            .where(eq(levelsTable.id, this.$.id))
        await this.db.delete(rateQueueTable)
            .where(eq(rateQueueTable.levelId, this.$.id))
        await this.db.delete(commentsTable)
            .where(eq(commentsTable.levelId, this.$.id))
    }
}

const validateSchema = z.object({
    name: z.string().max(64),
    description: z.string().max(512).optional().default(""),
    password: z.string().max(8).optional().default(""),
    version: z.number().gt(0),
    trackId: z.number().gte(0),
    songId: z.number().gte(0),
    versionGame: z.number().gte(0),
    versionBinary: z.number().gte(0),
    stringLevel: z.string().min(16),
    originalId: z.number().gte(0),
    objects: z.number().gte(0),
    starsRequested: z.number().gte(0).lte(10),
    userCoins: z.number().gte(0).lte(3),
}).check(evt => {
    if (evt.value.objects < 100 && !ALLOW_LESS_THAN_100_OBJECTS)
        evt.issues.push({
            code: "custom",
            message: "Objects must be at least 100",
            input: evt.value
        })
})

const ALLOW_LESS_THAN_100_OBJECTS = true