import { GameConstants } from '../../modules/GameConstants';

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/worldmap/MapHelper.ts
export class MapHelper {
    static moveToRoute(route: number, region: GameConstants.Region): void;
    static moveToTown(townName: string): void;
    static normalizeRoute(route: number, region: GameConstants.Region, skipIgnoredRoutes?: boolean): number;
}
