import { GameConstants } from '../GameConstants';
import RegionRoute from './RegionRoute';

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/routes/Routes.ts
export default class Routes {
    static getRoutesByRegion(region: GameConstants.Region): RegionRoute[];
}
