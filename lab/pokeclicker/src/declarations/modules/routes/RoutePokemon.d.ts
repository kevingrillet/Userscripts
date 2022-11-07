import { PokemonNameType } from '../pokemons/PokemonNameType';
import SpecialRoutePokemon from './SpecialRoutePokemon';

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/routes/RoutePokemon.ts
export default class RoutePokemon {
    headbutt: PokemonNameType[];
    land: PokemonNameType[];
    special: SpecialRoutePokemon[];
    water: PokemonNameType[];
}
