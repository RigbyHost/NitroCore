import {Database} from "~/utils/useDrizzle";
import {levelpacksTable} from "~~/drizzle";
import {eq} from "drizzle-orm";

export class LevelPackController {
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

    getGauntlets = async () =>
        this.db.query.levelpacksTable.findMany({
            where: (lp, {eq}) => eq(lp.isGauntlet, true),
            orderBy: (lp, {asc}) => asc(lp.packName), // Check if CAST (lp.packName AS int) is needed
        })

    getGauntletLevels = async (id: number) => {
        const gauntlet = await this.db.query.levelpacksTable.findFirst({
            where: (lp, {eq, and}) => and(
                eq(lp.id, id),
                eq(lp.isGauntlet, true)
            ),
        })
        if (!gauntlet)
            return []
        if (gauntlet.levels.length < 5)
            return []
        return gauntlet.levels.slice(0,5)
    }

    getMappacks = async (page: number) => {
        const mappacks = await this.db.query.levelpacksTable.findMany({
            where: (lp, {eq}) => eq(lp.isGauntlet, false),
            limit: 10,
            offset: page*10,
        })
        const total = await this.db.$count(levelpacksTable, eq(levelpacksTable.isGauntlet, false))

        return {mappacks, total}
    }
}