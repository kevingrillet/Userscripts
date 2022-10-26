import { PokemonNameType } from "./PokemonNameType";

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/dungeons/Dungeon.ts
export class Dungeon {
    name: string;
    get pokemonList(): PokemonNameType[];
}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/dungeons/DungeonRunner.ts
export class DungeonRunner {
    static dungeon: Dungeon;
    static dungeonFinished(p: boolean): boolean;
    static fighting(p: boolean): boolean;
    static fightingBoss(p: boolean): boolean;
}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/dungeons/Dungeon.ts#L386
export const dungeonList: { [dungeonName: string]: Dungeon };
