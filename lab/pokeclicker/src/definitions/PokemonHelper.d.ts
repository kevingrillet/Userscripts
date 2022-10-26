import { PokemonNameType } from "./PokemonNameType";

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/pokemons/DataPokemon.ts
export class DataPokemon {
    id: number;

}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/pokemons/PokemonHelper.ts
export class PokemonHelper {
    static getPokemonByName(name: PokemonNameType): DataPokemon;
}
