import { GameConstants } from '../GameConstants';
import RoutePokemon from './RoutePokemon';

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/routes/RegionRoute.ts
export default class RegionRoute {
    isUnlocked(): boolean;
    number: number;
    pokemon: RoutePokemon;
    region: GameConstants.Region;
    routeName: string;
    subRegion?: number;
}
