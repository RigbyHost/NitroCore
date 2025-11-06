import { sql } from "drizzle-orm"
import {questsTable} from "~~/drizzle";

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
        if (type) {
            const data = await this.db.query.questsTable.findFirst({
                where: (quest, {eq, gt, and}) => and(
                    eq(quest.type, type),
                    gt(quest.timeAdded, sql`CURRENT_TIMESTAMP`) // AVAILABLE
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
                where: (quest) => {
                    return numericType === 2 ? sql`${quest.type}>1` : sql`${quest.type}=${numericType}`
                }
            })
            return data || null
        }

        return null
    }

    getQuests = async () => {
        const max_id = await this.db.$count(questsTable, sql`${questsTable.type}>1`)
        return this.db.query.questsTable.findMany({
            where: (quest, {gt, lte, and}) => and(
                gt(quest.timeAdded, sql`CURRENT_TIMESTAMP`),
                sql`${questsTable.type}>1`,
            ),
            limit: 3,
            orderBy: (quest, {sql}) => sql`RANDOM()`
        });
    }
}