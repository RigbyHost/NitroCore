import {LevelController} from "~~/controller/LevelController";


export class LevelFilter {
    private controller: LevelController
    private readonly db: Database

    constructor(controller: LevelController) {
        this.controller = controller
        this.db = controller.$db
    }

    searchLevels = async () => {}
}

type SearchLevelsParams = {
    searchTerm: string,
    difficulties: number[],
    demonDifficulty: number,
    length: number[],
}