import { PokemonNameType } from "../../modules/pokemons/PokemonNameType";

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/dungeons/Dungeon.ts
export class Dungeon {
    name: string;
    get pokemonList(): PokemonNameType[];
}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/dungeons/Dungeon.ts#L386
export const dungeonList: { [dungeonName: string]: Dungeon };
