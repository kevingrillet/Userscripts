// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/GameConstants.d.ts
export namespace GameConstants {
    function getDungeonIndex(dungeon: string): number;
    function getGymIndex(gym: string): number;
    enum GameState {
        idle,
        paused,
        fighting,
        gym,
        dungeon,
        safari,
        town,
        shop,
        battleFrontier,
        temporaryBattle
    }
    enum Pokerus {
        'Uninfected',
        'Infected',
        'Contagious',
        'Resistant',
    }
    enum Region {
        none,
        kanto,
        johto,
        hoenn,
        sinnoh,
        unova,
        kalos,
        alola,
        galar,
        final,
    }
    const RegionDungeons: string[][];
    const RegionGyms: string[][];
}
