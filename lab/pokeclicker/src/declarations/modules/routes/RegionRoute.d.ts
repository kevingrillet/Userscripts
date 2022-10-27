import { RoutePokemon } from './RoutePokemon';

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/routes/RegionRoute.ts
export class RegionRoute {
    isUnlocked(): boolean;
    number: number;
    pokemon: RoutePokemon;
    routeName: string;
    subRegion?: number;
}
