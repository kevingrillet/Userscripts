import { Statistics } from "../modules/DataStore/StatisticsStore/index";
import { GameConstants } from "../modules/GameConstants";
import { Party } from "./party/Party";

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/Game.ts
export class Game{
    gameState: GameConstants.GameState;
    party: Party;
    statistics: Statistics;
}
