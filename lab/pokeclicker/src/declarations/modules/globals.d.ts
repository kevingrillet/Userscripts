import { Player } from '../scripts/Player';
import { PokemonNameType } from './pokemons/PokemonNameType';

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/globals.ts
type TmpPokemonListData = {
    base: {
        hitpoints: number;
    };
    eggCycles: number;
};

declare global {
    const player: Player;
    const pokemonMap: Record<PokemonNameType | number, TmpPokemonListData>;
}
