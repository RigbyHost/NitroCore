import {gte, inArray, SQL, sql} from "drizzle-orm";
import {scoresTable} from "~~/drizzle";
import {UserController} from "~~/controller/UserController";
import {FriendshipController} from "~~/controller/FriendshipController";


export class ScoresController {
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

    getOneScore = async (scoreId: number) => {
        const data = await this.db.query.scoresTable.findFirst({
            where: (score, {eq}) => eq(score.id, scoreId)
        })
        return data || null
    }

    getScoresForLevel = async (
        levelId: number,
        type: "default" | "week" | "friends",
        mode: "regular" | "platformer",
        uid?: number
    ) => {
        let filter: SQL = sql`1=1`
        switch (type) {
            case "week":
                // TODO: Clarify how the fuck should this work: DATE - 7 days or like really this week
                filter = gte(
                    scoresTable.postedTime,
                    sql`CURRENT_DATE - INTERVAL '1 day' * (EXTRACT(DOW FROM CURRENT_DATE)::INT - 1)` // This week's monday
                )
                break
            case "friends":
                const friendshipController = new FriendshipController(this.db)
                const friends = await friendshipController.getAccountFriendsIds(uid || 0)
                if (!friends) return []
                filter = inArray(scoresTable.uid, friends)
                break
        }
        const data = await this.db.query.scoresTable.findMany({
            where: (level, {and, eq}) => and(
                eq(level.levelId, levelId), filter
            ),
            orderBy: (level, {desc}) => desc(level.percent)
        })

        return data?.map((d, i) => ({
            ...d,
            ranking: mode === "platformer"
                ? i + 1 // 1 -> 1st, 2 -> 2nd, 3 -> 3rd
                : d.percent === 100 ? 1 : d.percent >= 75 ? 2 : 3 // 100% -> 1st, 75%+ -> 2nd, else -> 3rd
        })) || null
    }

    uploadScore = async (
        data: typeof scoresTable.$inferInsert
    ) => this.db.insert(scoresTable).values(data)

    updateScore = async (
        data: Pick<typeof scoresTable.$inferSelect, "id"> & Partial<typeof scoresTable.$inferSelect>
    ) => this.db.update(scoresTable).set(data)
}