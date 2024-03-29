import { Dungeon } from '../dungeons/Dungeon';
import { TownContent } from './TownContent';

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/towns/Town.ts
export class Town {
    content: TownContent[];
    dungeon?: Dungeon;
    name: string;
}
