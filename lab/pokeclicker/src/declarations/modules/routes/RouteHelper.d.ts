import { GameConstants } from '../GameConstants';
import { PokemonNameType } from '../pokemons/PokemonNameType';

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/wildBattle/RouteHelper.ts
export class RouteHelper {
    static getAvailablePokemonList(route: number, region: GameConstants.Region, includeHeadbutt?: boolean): PokemonNameType[];
    static minPokerus(possiblePokemon: PokemonNameType[]): number;
    static routeCompleted(route: number, region: GameConstants.Region, includeShiny: boolean, includeHeadbutt?: boolean): boolean;
}
