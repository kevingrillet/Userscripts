import { PokemonNameType } from "../pokemons/PokemonNameType";
import { SpecialRoutePokemon } from "./SpecialRoutePokemon";

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/routes/RoutePokemon.ts
export class RoutePokemon {
    land: PokemonNameType[];
    water: PokemonNameType[];
    headbutt: PokemonNameType[];
    special: SpecialRoutePokemon[];
}
