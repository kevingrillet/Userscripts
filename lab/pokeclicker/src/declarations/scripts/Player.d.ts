import { Town } from './towns/Town';

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/Player.ts
export class Player {
    highestRegion: () => number;
    region: number;
    route: () => number;
    subregion: number;
    town: () => Town;
}
