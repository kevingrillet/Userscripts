import { GameConstants } from "../../modules/GameConstants";
import { PokemonNameType } from "../../modules/pokemons/PokemonNameType";

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
