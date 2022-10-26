import { Town } from "./Gym";

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/Player.ts
export class Player{
    highestRegion(): number;
    region: number;
    subregion: number;
    town(): Town;
}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/globals.ts
type TmpPokemonListData = {
    eggCycles: number;
}

declare var player: Player;
declare var pokemonMap: Array<TmpPokemonListData>;
// Hein?? https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/pokemons/PokemonList.ts#L25883
