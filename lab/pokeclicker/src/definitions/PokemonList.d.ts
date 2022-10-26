import { GameConstants } from "./GameConstants";

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/pokemons/PokemonList.ts
type PokemonListData = {
    id: number;
    nativeRegion?: GameConstants.Region;
}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/pokemons/PokemonList.ts
export var pokemonList: PokemonListData[];
