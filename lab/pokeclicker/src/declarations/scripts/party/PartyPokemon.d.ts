import { GameConstants } from '../../modules/GameConstants';
import { PokemonNameType } from '../../modules/pokemons/PokemonNameType';

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/party/PartyPokemon.ts
export class PartyPokemon {
    baseAttack: number;
    evs: () => number;
    id: number;
    name: PokemonNameType;
    pokerus: GameConstants.Pokerus;
    proteinsUsed: () => number;
    shiny: boolean;
}
