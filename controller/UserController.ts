import {Database} from "~/utils/useDrizzle";
import {usersTable} from "~~/drizzle";
import {User} from "~~/controller/User";
import {sql} from "drizzle-orm";
import {union} from "drizzle-orm/mysql-core";

export class UserController {
    private readonly db: Database

    constructor(db: Database) {
        this.db = db
    }

    get $db() {
        return this.db
    }

    countUsers = async () => this.db.$count(usersTable)

    searchUsers = async (search: string) => {
        const searchId = parseInt(search) || 0
        if (!searchId && search.length < 3) return []
        const results = await this.db.query.usersTable
            .findMany({
                columns: {
                    uid: true,
                },
                where: (user, {or, eq, ilike}) => or(
                    eq(user.uid, searchId),
                    ilike(user.username, `%${search}%`)
                ),
                orderBy: (user, {desc}) => desc(user.stars),
                limit: 10
            })

        return results.map(r => r.uid)
    }

    getOneUser = async (
        {uid, username, email}: { uid?: number, username?: string, email?: string },
        withRole = false,
    ) => {
        let user: typeof usersTable.$inferSelect = null
        if (uid)
            user = await this.db.query.usersTable
                .findFirst({
                    where: (user, {eq}) => eq(user.uid, uid),
                    with: {
                        role: withRole || undefined,
                    }
                })
        if (username)
            user = await this.db.query.usersTable
                .findFirst({
                    where: (user, {eq}) => eq(user.username, username),
                    with: {
                        role: withRole || undefined,
                    }
                })
        if (email)
            user = await this.db.query.usersTable
                .findFirst({
                    where: (user, {eq}) => eq(user.email, email),
                    with: {
                        role: withRole || undefined,
                    }
                })
        if (!user) return null
        return new User(this, user)
    }

    getManyUsers = async (
        ids: number[],
        withRole = false,
    ) => {
        const users = await this.db.query.usersTable
            .findMany({
                where: (user, {inArray}) => inArray(user.uid, ids),
                with: {
                    role: withRole || undefined,
                }
            })
        return users.map(user => new User(this, user))
    }

    getUidByUsername = async (username: string) => {
        const user = await this.db.query.usersTable
            .findFirst({
                columns: {uid: true},
                where: (user, {eq}) => eq(user.username, username)
            })
        return user?.uid
    }

    getLeaderboard = async <T extends "stars" | "cpoints" | "global" | "friends">(
        type: T,
        friendsIds: T extends "friends" ? number[] : never,
        globalStars: T extends "global" ? number : never,
        limit: T extends "stars" | "cpoints" ? number : never
    ) => {
        let uids: number[] = []

        switch (type) {
            case "stars":
                uids = await this.db.query.usersTable
                    .findMany({
                        columns: {uid: true},
                        where: (user, {and, gt, eq}) => and(
                            eq(user.isBanned, 0),
                            gt(user.stars, 0)
                        ),
                        orderBy: (user, {desc, asc}) => [
                            desc(user.stars),
                            asc(user.username)
                        ],
                        limit: limit
                    })
                    .then(users => users.map(user => user.uid))
                break
            case "cpoints":
                uids = await this.db.query.usersTable
                    .findMany({
                        columns: {uid: true},
                        where: (user, {and, gt, eq}) => and(
                            eq(user.isBanned, 0),
                            gt(user.creatorPoints, 0)
                        ),
                        orderBy: (user, {desc, asc}) => [
                            desc(user.creatorPoints),
                            asc(user.username)
                        ],
                        limit: limit
                    })
                    .then(users => users.map(user => user.uid))
                break
            case "global":
                const leaderboardBetter = this.db
                    .select({
                        uid: usersTable.uid,
                        stars: usersTable.stars,
                        username: usersTable.username,
                    })
                    .from(usersTable)
                    .where(sql`${usersTable.stars}
                    >
                    ${globalStars}
                    AND
                    ${usersTable.isBanned}
                    =
                    0`)
                    .orderBy(sql`${usersTable.stars}
                    DESC`)
                    .limit(50)
                const leaderboardWorse = this.db
                    .select({
                        uid: usersTable.uid,
                        stars: usersTable.stars,
                        username: usersTable.username,
                    })
                    .from(usersTable)
                    .where(sql`${usersTable.stars}
                    >0 AND
                    ${usersTable.stars}
                    <=
                    ${globalStars}
                    AND
                    ${usersTable.isBanned}
                    =
                    0`)
                    .orderBy(sql`${usersTable.stars}
                    DESC`)
                    .limit(50)
                uids = await union(leaderboardBetter, leaderboardWorse)
                    .orderBy(sql`${usersTable.stars}
                    DESC,
                    ${usersTable.username}
                    ASC`)
                    .then(users => users.map(user => user.uid))
                break
            case "friends":
                uids = await this.db.query.usersTable
                    .findMany({
                        columns: {uid: true},
                        where: (user, {and, gt, eq, inArray}) => and(
                            eq(user.isBanned, 0),
                            gt(user.stars, 0),
                            inArray(user.uid, friendsIds)
                        ),
                        orderBy: (user, {desc, asc}) => [
                            desc(user.creatorPoints),
                            asc(user.username)
                        ],
                        limit: limit
                    })
                    .then(users => users.map(user => user.uid))
                break
        }
        return uids
    }

    logIn = async (
        username: string,
        password: string,
        ip: string,
        uid?: number
    ): Promise<{ code: number }> => {
        const user = uid
            ? await this.getOneUser({uid})
            : await this.getOneUser({username})
        if (!user)
            return {code: -1}
        if (user.$.isBanned)
            return {code: -12}
        const crypto = useCrypto()
        const passwordHash = crypto.sha256(crypto.sha512(password) + "SaltyTruth:sob:")
        if (passwordHash !== user.$.passwordHash)
            return {code: -1}
        user.$.lastIP = ip
        return {code: user.$.uid}
    }

    logIn22 = async (
        username: string,
        gjp2: string,
        ip: string,
        uid?: number
    ): Promise<{ code: number }> => {
        const user = uid
            ? await this.getOneUser({uid})
            : await this.getOneUser({username})
        if (!user)
            return {code: -1}
        if (user.$.isBanned)
            return {code: -12}
        if (gjp2 !== user.$.gjpHash)
            return {code: -1}
        user.$.lastIP = ip
        return {code: user.$.uid}
    }
}

// TODO: fabric and commit on beforeResponse