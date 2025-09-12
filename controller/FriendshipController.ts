import {friendRequestsTable, friendshipsTable} from "~~/drizzle";
import {and, eq} from "drizzle-orm";
import {UserController} from "~~/controller/UserController";
import {User} from "~~/controller/User";


export class FriendshipController {
    private readonly db: Database

    constructor(db: Database) {
        this.db = db
    }

    get $db() {
        return this.db
    }

    isAlreadyFriends = async (uid: number, targetId: number): Promise<boolean> =>
        await this.getOneFriendship(uid, targetId) !== null

    hasAlreadySentFriendRequest = async (uid: number, targetId: number): Promise<boolean> => {
        const count = await this.db.$count(friendRequestsTable, and(
            eq(friendRequestsTable.uidSrc, uid),
            eq(friendRequestsTable.uidDest, targetId),
        ))
        return count > 0
    }

    countFriendRequests = async (targetId: number): Promise<number> =>
        this.db.$count(friendRequestsTable, eq(friendRequestsTable.uidDest, targetId))

    getFriendRequests = async (uid: number, type: "sent" | "received", page = 0) => {
        // TODO: Subject to optimization in `with` to ignore anything besides auth, stats and vessels
        return this.db.query.friendRequestsTable.findMany({
            where: (req, {eq}) => eq(type === "sent" ? req.uidSrc : req.uidDest, uid),
            limit: 10,
            offset: page * 10,
            with: {
                sender: true,
                receiver: true,
            }
        });
    }

    getOneFriendship = async (uid: number, targetId: number): Promise<Nullable<typeof friendshipsTable.$inferSelect>> => {
        const friendship = await this.db.query.friendshipsTable.findFirst({
            where: (friendship, {eq, and, or}) => or(
                and(eq(friendship.uid1, uid), eq(friendship.uid2, targetId)),
                and(eq(friendship.uid1, targetId), eq(friendship.uid2, uid))
            )
        })
        return friendship || null
    }

    getOneFriendshipById = async (friendshipId: number): Promise<Nullable<typeof friendshipsTable.$inferSelect>> => {
        const friendship = await this.db.query.friendshipsTable.findFirst({
            where: (friendship, {eq}) => eq(friendship.id, friendshipId)
        })
        return friendship || null
    }

    deleteFriendship = async (uid: number, targetId: number) => {
        const friendship = await this.getOneFriendship(uid, targetId)
        if (!friendship) return
        const userController = new UserController(this.db)
        const u1 = await userController.getOneUser({uid: uid})
        const u2 = await userController.getOneUser({uid: targetId})
        if (!u1 || !u2) return
        u1.friendships.remove(friendship.id)
        u2.friendships.remove(friendship.id)
        await u1.commit()
        await u2.commit()
        await this.db.delete(friendshipsTable).where(eq(friendshipsTable.id, friendship.id))
    }

    getAccountFriendsIds = async (
        uid: number, user?: User
    ): Promise<number[]> => {
        const userController = new UserController(this.db)
        if (!user)
            user = await userController.getOneUser({uid}) as User
        if (!user) return []
        const friendsIds: number[] = []
        for (const friendshipId of user.$.friendshipIds) {
            const friendship = await this.getOneFriendshipById(friendshipId)
            if (!friendship) continue
            friendsIds.push(
                friendship.uid1 === uid ? friendship.uid2 : friendship.uid1
            )
        }
        return friendsIds
    }

    readFriendRequest = async (uid: number, reqestId: number) => {
        await this.db.update(friendRequestsTable)
            .set({
                isNew: false
            })
            .where(and(
                eq(friendRequestsTable.id, reqestId),
                eq(friendRequestsTable.uidDest, uid)
            ))
    }

    createFriendRequest = async (uid: number, targetId: number, comment: string) => {
        if (
            uid === targetId
            || await this.isAlreadyFriends(uid, targetId)
            || await this.hasAlreadySentFriendRequest(uid, targetId)
        ) return false

        const userController = new UserController(this.db)
        const user = await userController.getOneUser({uid: targetId})
        if (!user || user.$.settings.frS > 0) return false
        if (user.$.blacklistedUsers.includes(uid)) return false

        await this.db.insert(friendRequestsTable).values({
            uidSrc: uid,
            uidDest: targetId,
            comment,
        })

        return true
    }

    acceptFriendRequest = async (requestId: number, uid: number) => {
        const request = await this.db.query.friendRequestsTable.findFirst({
            where: (request, {eq}) => eq(request.id, requestId)
        })

        if (!request || request.uidSrc === request.uidDest || uid !== request.uidDest)
            return false

        const friendshipId = await this.db.insert(friendshipsTable).values({
            uid1: request.uidSrc,
            uid2: request.uidDest,
        }).$returningId()

        const userController = new UserController(this.db)

        await this.db.delete(friendRequestsTable).where(eq(friendRequestsTable.id, requestId))

        const user1 = await userController.getOneUser({uid: request.uidSrc})
        const user2 = await userController.getOneUser({uid: request.uidDest})
        if (!user1 || !user2) return false

        user1.friendships.add(friendshipId[0].id)
        user2.friendships.add(friendshipId[0].id)

        await user1.commit()
        await user2.commit()

        return true
    }

    deleteFriendRequest = async (uid: number, targetId: number, sender = false) => {
        const request = await this.db.query.friendRequestsTable.findFirst({
            where: (request, {eq, and}) => and(
                eq(request.uidSrc, sender ? uid : targetId),
                eq(request.uidDest, sender ? targetId : targetId)
            )
        })

        if (!request || request.uidSrc === request.uidDest || uid !== request.uidDest)
            return false

        await this.db.delete(friendRequestsTable).where(eq(friendRequestsTable.id, request.id))

        return true
    }
}