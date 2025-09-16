import { sql } from "drizzle-orm"

export class QuestsController {
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

    getOneQuest = async (
        {type, numericType}: {
            type?: "daily" | "weekly" | "event",
            numericType?: number
        }
    ) => {
        const typeMap = {
            daily: 0,
            weekly: 1,
            event: -1
        }
        if (type) {
            const data = await this.db.query.questsTable.findFirst({
                where: (quest, {eq, lt, and}) => and(
                    eq(quest.type, typeMap[type]),
                    lt(quest.timeAdded, sql`CURRENT_TIMESTAMP`) // AVAILABLE
                ),
                // LAST AVAILABLE
                orderBy: (quest, {desc}) => [desc(quest.timeAdded)]
            }).then(q => {
                if (q && type === "weekly")
                    q.id+=100001 // RobTop be damned
                return q
            })
            return data || null
        }
        if (numericType !== undefined) {
            switch (numericType) {
                case -1:
                    numericType = 0
                    break
                case -2:
                    numericType = 1
                    break
                case -3:
                    numericType = -1
                    break
            }
            const data = await this.db.query.questsTable.findFirst({
                where: (quest, {eq, gt}) => {
                    return numericType === 2 ? gt(quest.type, 1) : eq(quest.type, numericType!)
                }
            })
            return data || null
        }

        return null
    }

    getQuests = async (uid: number) => {

    }
}