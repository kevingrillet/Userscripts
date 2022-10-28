import { PartyPokemon } from './PartyPokemon';

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/party/Party.ts
export class Party {
    calculateClickAttack(useItem?: boolean): number;
    caughtPokemon: Array<PartyPokemon>;
    getPokemon(id: number): PartyPokemon | undefined;
}
