// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/towns/Town.ts
export class Town {
    content: TownContent[];
    name: string;
}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/towns/TownContent.ts
export class TownContent {
    parent: Town;
    protectedOnclick(): void;
}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/gym/Gym.ts
export class Gym extends TownContent{
    town: string;
}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/gym/Champion.ts
export class Champion extends Gym {}

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/gym/GymList.ts
export const GymList: { [townName: string]: Gym };
