import { Town } from './Town';

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/towns/TownContent.ts
export abstract class TownContent {
    isUnlocked(): boolean;
    parent: Town;
    protectedOnclick(): void;
}
