// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/DataStore/StatisticStore/index.ts
export class Statistics {
    dungeonsCleared: Array<KnockoutObservable<number>>;
    gymsDefeated: Array<KnockoutObservable<number>>;
    routeKills: Record<string, Record<string, KnockoutObservable<number>>>;
}
