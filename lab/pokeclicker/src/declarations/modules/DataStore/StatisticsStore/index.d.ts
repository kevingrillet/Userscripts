// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/DataStore/StatisticStore/index.ts
export class Statistics {
    dungeonsCleared: Array<() => number>;
    gymsDefeated: Array<() => number>;
    routeKills: Record<string, Record<string, () => number>>;
}
