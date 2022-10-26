import { GameConstants } from "./GameConstants";
import { PokemonNameType } from "./PokemonNameType";

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/routes/SpecialRoutePokemon.ts
export class SpecialRoutePokemon{
    pokemon: PokemonNameType[];
}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/routes/RoutePokemon.ts
export class RoutePokemon {
    land: PokemonNameType[];
    water: PokemonNameType[];
    headbutt: PokemonNameType[];
    special: SpecialRoutePokemon[];
}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/routes/RegionRoute.ts
export class RegionRoute {
    number: number;
    pokemon: RoutePokemon;
    routeName: string;
    subRegion?: number;
}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/routes/Routes.ts
export class Routes {
    public static getRoutesByRegion(region: GameConstants.Region): RegionRoute[];
}
