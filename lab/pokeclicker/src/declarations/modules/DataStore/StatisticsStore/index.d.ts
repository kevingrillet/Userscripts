// https://github.com/pokeclicker/pokeclicker/blob/develop/src/modules/DataStore/StatisticStore/index.ts
export default class Statistics {
    dungeonsCleared: Array<() => number>;
    gymsDefeated: Array<() => number>;
    pokemonHatched: Array<() => number>;
    routeKills: Record<string, Record<string, () => number>>;
}
