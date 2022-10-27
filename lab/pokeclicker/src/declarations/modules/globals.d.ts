import { Player } from '../scripts/Player';
import { PokemonNameType } from './pokemons/PokemonNameType';

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/globals.ts
type TmpPokemonListData = {
    eggCycles: number;
};

declare var player: Player;
declare var pokemonMap: Record<PokemonNameType | number, TmpPokemonListData>;
// Hein?? https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/pokemons/PokemonList.ts#L25883
