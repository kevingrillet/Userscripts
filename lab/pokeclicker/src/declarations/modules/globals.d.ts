import { Player } from "../scripts/Player";

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/globals.ts
type TmpPokemonListData = {
    eggCycles: number;
}

declare var player: Player;
declare var pokemonMap: Array<TmpPokemonListData>;
// Hein?? https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/pokemons/PokemonList.ts#L25883
