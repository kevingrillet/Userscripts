import { PartyPokemon } from './PartyPokemon';

// https://github.com/pokeclicker/pokeclicker/blob/develop/src/scripts/party/Party.ts
export class Party {
    caughtPokemon: Array<PartyPokemon>;
    getPokemon(id: number): PartyPokemon | undefined;
}
