import { Player } from '../scripts/Player';
import { PokemonNameType } from './pokemons/PokemonNameType';

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/globals.ts
type TmpPokemonListData = {
    eggCycles: number;
    base: {
        hitpoints: number;
    };
};

declare var player: Player;
declare var pokemonMap: Record<PokemonNameType | number, TmpPokemonListData>;
