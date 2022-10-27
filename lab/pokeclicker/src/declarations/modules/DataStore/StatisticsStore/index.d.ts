// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/DataStore/StatisticStore/
export class Statistics{
    dungeonsCleared: Array<number>;
    gymsDefeated: Array<number>;
    routeKills: Record<string, Record<string, number>>;
}