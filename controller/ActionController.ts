import {ActionData, actionsTable, ActionVariant} from "~~/drizzle";
import {UserController} from "~~/controller/UserController";
import {and, eq} from "drizzle-orm";
import {MakeOptional} from "~/utils/types";

/**
 * Controller for action logging
 *
 * Responsible for logging actions performed by users and keep track of likes
 *
 * @class ActionController
 */
export class ActionController {
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

    /**
     * Register a new action. Used internally by routes and controllers
     */
    registerAction = async (
        action: AvailableActions,
        uid: number,
        targetId: number,
        data: MakeOptional<ActionData, "action">,
    ) => {
        const userController = new UserController(this.db)
        const user = uid > 0 ? await userController.getOneUser({uid}): null

        let type: ActionVariant
        switch (action) {
            case "register_user":
                type = "register_user"
                data.action = "Register"
                break
            case "login_user":
                type = "login_user"
                data.action = "Login"
                break
            case "delete_user":
                type = "delete_user"
                data.action = "Delete"
                break
            case "ban_user":
            case "unban_user":
                type = "ban_event"
                data.action = action === "ban_user" ? "Ban" : "Unban"
                const luser = await userController.getOneUser({uid: targetId})
                data.uname = luser?.$.username || ""
                break
            case "level_upload":
                type = "level_event"
                data.action = "Upload"
                break
            case "level_update":
                type = "level_event"
                data.action = "Update"
                break
            case "level_delete":
                type = "level_event"
                data.action = "Delete"
                break
            case "level_rate":
                type = "level_event"
                data.action = "Rate"
                break
            case "list_upload":
                type = "list_event"
                data.action = "Upload"
                break
            case "list_update":
                type = "list_event"
                data.action = "Update"
                break
            case "list_delete":
                type = "list_event"
                data.action = "Delete"
                break
            case "list_rate":
                type = "list_event"
                data.action = "Rate"
                break
            case "like_level":
                type = "level_like"
                data.action = "LikeLevel"
                break
            case "like_comment":
                type = "comment_like"
                data.action = "LikeComment"
                break
            case "like_account_comment":
                type = "account_comment_like"
                data.action = "LikeAcccomment"
                break
            case "like_list":
                type = "list_like"
                data.action = "LikeList"
                break
            default:
                return
        }

        const isMod = user ? user.$.roleId > 0 : false

        await this.db.insert(actionsTable).values({
            uid: uid,
            actionType: type,
            targetId: targetId,
            isMod: isMod,
            data: data as ActionData,
        })
    }

    /**
     * Check if a user has liked an item (level, comment, account comment, 2.2 list)
     *
     * @param itemType
     * @param uid
     * @param targetId
     */
    isItemLiked = async (
        itemType: ItemType,
        uid: number,
        targetId: number
    ): Promise<boolean> => {
        let type : ActionVariant
        switch (itemType) {
            case "level":
                type = "level_like"
                break
            case "comment":
                type = "comment_like"
                break
            case "account_comment":
                type = "account_comment_like"
                break
            case "list":
                type = "list_like"
                break
            default:
                return true
        }

        const count = await this.db.$count(actionsTable, and(
            eq(actionsTable.uid, uid),
            eq(actionsTable.actionType, type),
            eq(actionsTable.targetId, targetId),
        ))
        return count > 0
    }
}

type AvailableActions = "register_user" | "login_user" | "delete_user" | "ban_user" | "unban_user" |
    "level_upload" | "level_delete" | "level_update" | "level_rate" |
    "list_upload" | "list_delete" | "list_update" | "list_rate" |
    "like_level" | "like_comment" | "like_account_comment" | "like_list"

type ItemType = "level" | "comment" | "account_comment" | "list"