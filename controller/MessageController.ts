import {messagesTable} from "~~/drizzle";
import {and, eq, or} from "drizzle-orm";
import {z} from "zod";
import {UserController} from "~~/controller/UserController";
import {FriendshipController} from "~~/controller/FriendshipController";


export class MessageController {
    private readonly db: Database

    constructor(db: Database) {
        this.db = db
    }

    get $db() {
        return this.db
    }

    getOneMessage = async (id: number, withUsers = false) => {
        const message = await this.db.query.messagesTable.findFirst({
            where: (message, operators) => operators.eq(message.id, id),
            with: withUsers ? {
                sender: {columns: {username: true}},
                receiver: {columns: {username: true}}
            } : undefined
        })
        return message || null
    }

    getManyMessages = async (uid: number, page: number, type: "sent" | "received"): Promise<{
        total: number,
        messages: (typeof messagesTable.$inferSelect & {username: string})[]
    }> => {
        const filter = type === "sent" ? eq(messagesTable.uidSrc, uid) : eq(messagesTable.uidDest, uid)

        const count = await this.db.$count(messagesTable, filter)
        if (!count)
            return {
                total: count,
                messages: []
            }

        const messages = await this.db.query.messagesTable.findMany({
            where: filter,
            orderBy: (message, operators) => operators.desc(message.postedTime), // TODO: Need to check
            limit: 10,
            offset: page*10,
            with: {
                sender: {columns: {username: true}},
                receiver: {columns: {username: true}}
            }
        })

        return {
            total: count,
            messages: messages.map(m => ({
                ...m,
                username: (type === "sent" ? m.sender.username : m.receiver.username) || "[DELETED]",
                sender: undefined,
                receiver: undefined
            }))
        }
    }

    countMessages = async (uid: number, isNew: boolean) => {
        const filter = eq(messagesTable.uidDest, uid)
        return this.db.$count(
            messagesTable,
            isNew
                ? and(filter, eq(messagesTable.isNew, true))
                : filter
        )
    }

    deleteMessage = async (id: number, uid: number) => {
        await this.db.delete(messagesTable).where(
            and(
                eq(messagesTable.id, id),
                or(eq(messagesTable.uidDest, uid), eq(messagesTable.uidSrc, uid))
            )
        )
    }

    sendMessage = async (message: typeof messagesTable.$inferInsert): Promise<boolean> => {
        const {success} = validateSchema.safeParse(message)
        if (!success)
            return false

        const userController = new UserController(this.db)
        const friendshipController = new FriendshipController(this.db)
        const receiver = await userController.getOneUser({uid: message.uidDest})
        if (!receiver)
            return false

        if (receiver.$.settings.mS === 2 || receiver.$.blacklistedUsers?.includes(message.uidSrc))
            return false

        if (receiver.$.settings.mS === 2) {
            if (!await friendshipController.isAlreadyFriends(message.uidSrc, message.uidDest))
                return false
        }

        await this.db.insert(messagesTable).values(message)
        return true
    }
}

const validateSchema = z.object({
    subject: z.string().max(256).optional(),
    message: z.string().min(1).max(1024)
})