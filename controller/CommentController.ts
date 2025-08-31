import {Database} from "~/utils/useDrizzle";
import {accountCommentsTable, commentsTable} from "~~/drizzle";
import {and, eq, sql} from "drizzle-orm";
import {ActionController} from "~~/controller/ActionController";

export class CommentController {
    private readonly db: Database

    /**
     * @param db Drizzle database instance created via {@link useDrizzle} or {@link getDrizzleMiddleware}
     */
    constructor(db: Database) {
        this.db = db
    }

    get $db() {
        return this.db
    }

    countLevelComments = async (levelId?: number) =>
        this.db.$count(commentsTable, levelId ? eq(commentsTable.levelId, levelId) : undefined)

    countUserComments = async (uid?: number) =>
        this.db.$count(accountCommentsTable, uid ? eq(accountCommentsTable.uid, uid) : undefined)

    countCommentHistory = async (uid: number) =>
        this.db.$count(commentsTable, eq(commentsTable.uid, uid))

    getOneLevelComment = async (id: number) => {
        const comment = await this.db.query.commentsTable.findFirst({
            where: (comment, {eq}) => eq(comment.id, id)
        })
        return comment || null
    }

    getOneAccountComment = async (id: number) => {
        const comment = await this.db.query.accountCommentsTable.findFirst({
            where: (comment, {eq}) => eq(comment.id, id)
        })
        return comment || null
    }

    getAllAccountComments = async (uid: number, page = 0) =>
        this.db.query.accountCommentsTable.findMany({
            where: (comment, {eq}) => eq(comment.uid, uid),
            orderBy: (comment, {desc}) => [desc(comment.postedTime)],
            limit: 10,
            offset: page * 10
        })

    getAllLevelComments = async (
        levelId: number,
        sortBy: "likes" | "postedTime" = "postedTime",
        page = 0,
    ) =>
        this.db.query.commentsTable.findMany({
            where: (comment, {eq}) => eq(comment.levelId, levelId),
            orderBy: (comment, {desc}) => [desc(sortBy === "likes" ? comment.likes : comment.postedTime)],
            limit: 10,
            offset: page * 10
        })

    getCommentHistory = async (
        uid: number,
        sortBy: "likes" | "postedTime" = "postedTime",
        page = 0
    ) =>
        this.db.query.commentsTable.findMany({
            where: (comment, {eq}) => eq(comment.uid, uid),
            orderBy: (comment, {desc}) => [desc(sortBy === "likes" ? comment.likes : comment.postedTime)],
            limit: 10,
            offset: page * 10
        })

    postLevelComment = async (
        uid: number,
        levelId: number,
        content: string,
        completionPercentage = 0
    ) => {
        await this.db.insert(commentsTable).values({
            uid,
            levelId,
            comment: content,
            percent: completionPercentage,
        })
    }

    postAccountComment = async (
        uid: number,
        content: string
    ) => {
        await this.db.insert(accountCommentsTable).values({
            uid,
            comment: content,
        })
    }

    deleteLevelComment = async (id: number, uid: number) => {
        await this.db.delete(commentsTable).where(and(
            eq(commentsTable.id, id),
            eq(commentsTable.uid, uid)
        ))
    }

    deleteAccountComment = async (id: number, uid: number) => {
        await this.db.delete(accountCommentsTable).where(and(
            eq(accountCommentsTable.id, id),
            eq(accountCommentsTable.uid, uid)
        ))
    }

    deleteLevelCommentByOwner = async (id: number, levelId: number) => {
        await this.db.delete(commentsTable).where(and(
            eq(commentsTable.id, id),
            eq(commentsTable.levelId, levelId)
        ))
    }

    likeAccountComment = async (id: number, uid: number, action: "like" | "dislike") => {
        const actionController = new ActionController(this.db)
        if (await actionController.isItemLiked("account_comment", uid, id))
            return false

        await this.db.update(accountCommentsTable)
            .set({
                likes: action === "like"
                    ? sql`${accountCommentsTable.likes} + 1`
                    : sql`${accountCommentsTable.likes} - 1`
            })
            .where(eq(accountCommentsTable.id, id))

        await actionController.registerAction(
            "like_account_comment",
            uid,
            id,
            {action: action[0].toUpperCase() + action.slice(1)}
        )
    }

    likeLevelComment = async (id: number, uid: number, action: "like" | "dislike") => {
        const actionController = new ActionController(this.db)
        if (await actionController.isItemLiked("comment", uid, id))
            return false

        await this.db.update(commentsTable)
            .set({
                likes: action === "like"
                    ? sql`${commentsTable.likes} + 1`
                    : sql`${commentsTable.likes} - 1`
            })
            .where(eq(commentsTable.id, id))

        await actionController.registerAction(
            "like_comment",
            uid,
            id,
            {action: action[0].toUpperCase() + action.slice(1)}
        )
    }
}