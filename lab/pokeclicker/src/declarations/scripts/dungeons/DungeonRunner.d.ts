import { Dungeon } from './Dungeon';

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/dungeons/DungeonRunner.ts
export class DungeonRunner {
    static dungeon: Dungeon;
    static dungeonCompleted(dungeon: Dungeon, includeShiny: boolean): boolean;
    static dungeonFinished(p: boolean): boolean;
    static fighting(p: boolean): boolean;
    static fightingBoss(p: boolean): boolean;
}
