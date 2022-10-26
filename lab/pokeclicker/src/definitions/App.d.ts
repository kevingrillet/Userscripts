import { GameConstants } from "./GameConstants";
import { PokemonNameType } from "./PokemonNameType";

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/DataStore/StatisticStore/index.ts
export class Statistics{
    dungeonsCleared: Array<number>;
    gymsDefeated: Array<number>;
    routeKills: Record<string, Record<string, number>>;
}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/party/PartyPokemon.ts
export class PartyPokemon{
    evs(): number;
    proteinsUsed(): number;
    baseAttack: number;
    id: number;
    name: PokemonNameType;
    pokerus: GameConstants.Pokerus;
    shiny: boolean;
}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/party/Party.ts
export class Party{
    caughtPokemon: Array<PartyPokemon>;
    getPokemon(id: number): PartyPokemon | undefined;
}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/Game.ts
export class Game{
    gameState: GameConstants.GameState;
    party: Party;
    statistics: Statistics;
}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/App.ts
export namespace App{
    var game: Game;
}
