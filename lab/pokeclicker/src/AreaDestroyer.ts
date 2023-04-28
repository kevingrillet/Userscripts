/**
 * @name:         AreaDestroyer
 * @author:       kevingrillet
 * @description:  Clear areas (roads/dungeons/gym) by doing Achievements, Catch Shiny, farm Evs (need PRKS ofc). Story need to be complete for every regions you want to farm.
 * @license:      GPL-3.0 License
 * @version:      1.1.5
 *
 * @required:     https://github.com/Ephenia/Pokeclicker-Scripts (Enhanced Auto Clicker) with AutoClick [ON]
 */

import { GameConstants } from './declarations/modules/GameConstants';
import { PokemonNameType } from './declarations/modules/pokemons/PokemonNameType';
import RegionRoute from './declarations/modules/routes/RegionRoute';
import { RouteHelper } from './declarations/modules/routes/RouteHelper';
import Routes from './declarations/modules/routes/Routes';
import { App } from './declarations/scripts/App';
import { Dungeon, dungeonList } from './declarations/scripts/dungeons/Dungeon';
import { DungeonRunner } from './declarations/scripts/dungeons/DungeonRunner';
import { Champion } from './declarations/scripts/gym/Champion';
import { Gym } from './declarations/scripts/gym/Gym';
import { GymList } from './declarations/scripts/gym/GymList';
import { PartyPokemon } from './declarations/scripts/party/PartyPokemon';
import { PokemonFactory } from './declarations/scripts/pokemons/PokemonFactory';
import { PokemonHelper } from './declarations/scripts/pokemons/PokemonHelper';
import { pokemonList } from './declarations/scripts/pokemons/PokemonList';
import { MapHelper } from './declarations/scripts/worldmap/Map';

namespace AreaDestroyer {
    export enum AreaType {
        none,
        road,
        dungeon,
        gym,
    }
    export enum DebugLevel {
        debug,
        log,
        warn,
        err,
    }
    export enum EndType {
        none,
        evs,
        steps,
    }
    export enum ScriptMode {
        defeat,
        shiny,
        pokerus,
    }
    class AreaToFarm {
        areaType: AreaType;
        region: number;
        route: number;
        subregion: number;
        town: string;
        gym: string;
        until: number;

        constructor() {
            this.areaType = AreaType.none;
            this.region = 0;
            this.route = 0;
            this.subregion = 0;
            this.town = '';
            this.gym = '';
            this.until = 0;
        }
    }

    class AreaOptions {
        all: boolean;
        boss: boolean;
        defeat: number;
        skip: boolean;

        constructor(defeat: number = 0, all: boolean = true, boss: boolean = false, skip: boolean = false) {
            this.all = all;
            this.boss = boss;
            this.defeat = defeat;
            this.skip = skip;
        }
    }

    class Options {
        defaultEnd: EndType;
        defaultTimeout: number;
        defaultTimeoutEnd: number;
        dungeon: AreaOptions;
        end: EndType;
        gym: AreaOptions;
        mode: ScriptMode;
        road: AreaOptions;
        debugLevel: DebugLevel;
        outputAreas: boolean;
        outputListPkm: boolean;
        resetQuests: boolean;

        constructor() {
            this.defaultEnd = EndType.evs;
            this.defaultTimeout = 1;
            this.defaultTimeoutEnd = 10;
            this.dungeon = new AreaOptions(10);
            this.end = EndType.none;
            this.gym = new AreaOptions(10);
            this.mode = ScriptMode.defeat;
            this.road = new AreaOptions(100);
            this.debugLevel = DebugLevel.log;
            this.defaultTimeout = 1;
            this.outputAreas = true;
            this.outputListPkm = true;
            this.resetQuests = true;
        }
    }

    export class AreaDestroyer {
        readonly defaultDigits: number = 2;
        readonly defaultNumberPkdxEff: number = 20;
        areaToFarm: AreaToFarm;
        areaToFarmOld: AreaToFarm;
        lastLoop: Date;
        options: Options;
        stop: boolean;
        timeout: number;

        constructor() {
            this.areaToFarm = new AreaToFarm();
            this.areaToFarmOld = this.areaToFarm;
            this.lastLoop = new Date();
            this.options = new Options();
            this.stop = false;
            this.timeout = this.options.defaultTimeout;
        }

        auto(): void {
            setTimeout(() => {
                this.lastLoop = new Date();
                if (this.stop === true) {
                    this.stop = false;
                    this.print(`AreaDestroyer stopped`, DebugLevel.log);
                } else {
                    let curMax = 0;
                    switch (this.options.mode) {
                        case ScriptMode.defeat:
                            if (this.areaToFarm.areaType === AreaType.road && this.areaToFarm.route !== 0) {
                                curMax = App.game.statistics.routeKills[this.areaToFarm.region][this.areaToFarm.route]();
                            } else if (this.areaToFarm.areaType === AreaType.dungeon && this.areaToFarm.town !== '') {
                                curMax = App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(this.areaToFarm.town)]();
                            } else if (this.areaToFarm.areaType === AreaType.gym && this.areaToFarm.gym !== '') {
                                curMax = App.game.statistics.gymsDefeated[GameConstants.getGymIndex(this.areaToFarm.gym)]();
                            }
                            break;
                        case ScriptMode.pokerus:
                            curMax = App.game.party.caughtPokemon.filter((p) => p.pokerus >= GameConstants.Pokerus.Resistant).length;
                            break;
                        case ScriptMode.shiny:
                            curMax = App.game.party.caughtPokemon.filter((p) => p.shiny === true).length;
                            break;
                    }
                    if (this.areaToFarm.until === 0 || curMax >= this.areaToFarm.until || this.checkDone() === true) {
                        if (this.areaToFarm.areaType === AreaType.dungeon) {
                            this.stopAutoDungeon();
                            this.moveTo();
                        }
                        if (this.areaToFarm.areaType === AreaType.gym) {
                            this.stopAutoGym();
                            this.moveTo();
                        }
                        this.setAreaToFarm();
                        let chkRes = this.check();
                        if (chkRes === AreaType.road) {
                            this.moveTo();
                            if (!this.objectEqual(this.areaToFarm, this.areaToFarmOld)) this.print(`AreaDestroyer NextArea`, DebugLevel.log);
                            this.auto();
                        } else if (chkRes === AreaType.dungeon) {
                            this.moveTo();
                            if (this.startAutoDungeon() === true) {
                                if (!this.objectEqual(this.areaToFarm, this.areaToFarmOld)) this.print(`AreaDestroyer NextArea`, DebugLevel.log);
                                this.auto();
                            } else {
                                this.print(`AreaDestroyer Failed to auto dungeon`, DebugLevel.warn);
                            }
                        } else if (chkRes === AreaType.gym) {
                            this.moveTo();
                            if (this.startAutoGym() === true) {
                                if (!this.objectEqual(this.areaToFarm, this.areaToFarmOld)) this.print(`AreaDestroyer NextArea`, DebugLevel.log);
                                this.auto();
                            } else {
                                this.print(`AreaDestroyer Failed to auto gym`, DebugLevel.warn);
                            }
                        } else {
                            this.print(`AreaDestroyer DONE`, DebugLevel.log);
                            this.run();
                        }
                        this.areaToFarmOld = this.areaToFarm;
                    } else {
                        this.print(`AreaDestroyer IDLE ${curMax}/${this.areaToFarm.until}`);
                        this.auto();
                    }
                }
            }, this.timeout * 60 * 1000);
        }

        bestEvsFarm(topOpt: number = this.defaultNumberPkdxEff): void {
            this.setAreaToFarm();
            let lst = this.pkdxTopEff(topOpt);
            let max = 0;
            let best = '';
            for (let i = 0; i <= player.highestRegion(); i++) {
                let rg = this.capitalize(GameConstants.Region[i]);
                Routes.getRoutesByRegion(i).forEach((rt) => {
                    let nb = 0;
                    let pkmListEv = Array<String>();
                    this.concatPkmListFromRoute(rt).forEach((pkm) => {
                        if (lst.find((e) => e.name === pkm)) {
                            pkmListEv.push(pkm);
                            if (++nb >= max) {
                                max = nb;
                                best = `${rg} > ${rt.routeName} => ${max} ${pkmListEv}`;
                                this.areaToFarm.region = i;
                                this.areaToFarm.route = rt.number;
                                this.areaToFarm.subregion = rt?.subRegion || 0;
                            }
                        }
                    });
                });
            }
            if (!this.objectEqual(this.areaToFarm, this.areaToFarmOld)) this.print(`${best}`, DebugLevel.log);
        }

        bestRoadEggsBattle(attack?: number): void {
            let max = 0;
            let best = '';
            var atk = attack || App.game.party.calculateClickAttack(true);
            for (let i = 0; i <= player.highestRegion(); i++) {
                let rg = this.capitalize(GameConstants.Region[i]);
                Routes.getRoutesByRegion(i).forEach((rt) => {
                    let amount = Number(Math.sqrt(MapHelper.normalizeRoute(rt.number, rt.region)).toFixed(this.defaultDigits));
                    let maxHp: number = this.routeMaxHP(rt);
                    if (amount > max && maxHp < atk) {
                        max = amount;
                        best = `${rg} > ${rt.routeName} => ${max}`;
                        this.areaToFarm.region = i;
                        this.areaToFarm.route = rt.number;
                        this.areaToFarm.subregion = rt?.subRegion || 0;
                    }
                });
            }
            if (!this.objectEqual(this.areaToFarm, this.areaToFarmOld)) this.print(`${best}`, DebugLevel.log);
        }

        capitalize(text: string): string {
            return text.charAt(0).toUpperCase() + text.slice(1);
        }

        check(allDungeon: boolean = this.options.dungeon.all, allGym: boolean = this.options.gym.all, allRoad: boolean = this.options.road.all): number {
            this.setAreaToFarm();
            this.timeout = this.options.defaultTimeout;
            if (this.options.road.skip === false) {
                if (this.checkRoad(allRoad) === true) {
                    return AreaType.road;
                }
            }
            if (this.options.dungeon.skip === false) {
                if (this.checkDungeon(allDungeon) === true) {
                    return AreaType.dungeon;
                }
            }
            if (this.options.mode === ScriptMode.defeat && this.options.gym.skip === false) {
                if (this.checkGym(allGym) === true) {
                    return AreaType.gym;
                }
            }
            this.timeout = this.options.defaultTimeoutEnd;
            if (this.options.end !== EndType.none && this.options.resetQuests === true) App.game.quests.refreshQuests(true, false);
            if (this.options.end === EndType.evs) {
                this.bestEvsFarm();
                this.moveTo();
                return AreaType.road;
            }
            if (this.options.end === EndType.steps) {
                this.bestRoadEggsBattle();
                this.moveTo();
                return AreaType.road;
            }
            return AreaType.none;
        }

        checkDone(): boolean {
            switch (this.options.mode) {
                case ScriptMode.pokerus:
                    switch (this.areaToFarm.areaType) {
                        case AreaType.dungeon:
                            return RouteHelper.minPokerus(player.town().dungeon?.allAvailablePokemon() || []) === GameConstants.Pokerus.Resistant;
                        case AreaType.road:
                            return (
                                RouteHelper.minPokerus(RouteHelper.getAvailablePokemonList(player.route(), player.region, true)) ===
                                GameConstants.Pokerus.Resistant
                            );
                    }
                    break;
                case ScriptMode.shiny:
                    switch (this.areaToFarm.areaType) {
                        case AreaType.dungeon:
                            return DungeonRunner.dungeonCompleted(player.town().dungeon as Dungeon, true);
                        case AreaType.road:
                            return RouteHelper.routeCompleted(player.route(), player.region, true);
                    }
                    break;
            }
            return false;
        }

        checkDungeon(allOpt: boolean = this.options.dungeon.all): boolean {
            this.setAreaToFarm();
            let max = 0;
            let best = '';
            let pkmListTotal = Array<String>();
            let output = Array<{ region: string; dungeon: string; id: number; name: PokemonNameType; shiny: boolean; evs: number }>();
            if (allOpt === true) {
                for (let i = 0; i <= player.highestRegion(); i++) {
                    let rg = this.capitalize(GameConstants.Region[i]);
                    let dgs = GameConstants.RegionDungeons[i];
                    for (let j = 0; j < dgs.length; j++) {
                        if (dungeonList[dgs[j]].isUnlocked() === false) continue;
                        if (this.options.mode === ScriptMode.defeat) {
                            if (App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(dgs[j])]() < this.options.dungeon.defeat) {
                                this.setAreaToFarm(AreaType.dungeon, i, 0, 0, dgs[j], '', this.options.dungeon.defeat);
                                best = `${rg} > ${dgs[j]}`;
                                break;
                            }
                        } else {
                            let nb = 0;
                            let pkmList = this.concatPkmListFromDungeon(dungeonList[dgs[j]]);
                            let pkmListFarm = Array<String>();
                            if (
                                (this.options.mode === ScriptMode.shiny && DungeonRunner.dungeonCompleted(dungeonList[dgs[j]], true) === true) ||
                                (this.options.mode === ScriptMode.pokerus && RouteHelper.minPokerus(pkmList) === GameConstants.Pokerus.Resistant)
                            )
                                continue;
                            pkmList.forEach((pkm) => {
                                let hpkm = PokemonHelper.getPokemonByName(pkm);
                                let ppkm = App.game.party.getPokemon(hpkm.id);
                                if (
                                    ppkm &&
                                    ((this.options.mode === ScriptMode.shiny && ppkm?.shiny === false) ||
                                        (this.options.mode === ScriptMode.pokerus && ppkm?.pokerus === GameConstants.Pokerus.Contagious))
                                ) {
                                    pkmListTotal.push(pkm);
                                    pkmListFarm.push(pkm);
                                    output.push({ region: rg, dungeon: dgs[j], id: hpkm.id, name: pkm, shiny: ppkm.shiny, evs: ppkm.evs() });
                                    if (++nb > max) {
                                        max = nb;
                                        best = `${rg} > ${dgs[j]} => ${max} [${pkmListFarm.join(', ')}]`;
                                        this.setAreaToFarm(AreaType.dungeon, i, 0, 0, dgs[j]);
                                    }
                                }
                            });
                        }
                    }
                }
            } else {
                let rg = this.capitalize(GameConstants.Region[player.region]);
                let dgs = GameConstants.RegionDungeons[player.region];
                for (let j = 0; j < dgs.length; j++) {
                    if (dungeonList[dgs[j]].isUnlocked() === false) continue;
                    if (this.options.mode === ScriptMode.defeat) {
                        if (App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(dgs[j])]() < this.options.dungeon.defeat) {
                            this.setAreaToFarm(AreaType.dungeon, player.region, 0, 0, dgs[j], '', this.options.dungeon.defeat);
                            best = `${rg} > ${dgs[j]}`;
                            break;
                        }
                    } else {
                        let nb = 0;
                        let pkmList = this.concatPkmListFromDungeon(dungeonList[dgs[j]]);
                        let pkmListFarm = Array<String>();
                        if (
                            (this.options.mode === ScriptMode.shiny && DungeonRunner.dungeonCompleted(dungeonList[dgs[j]], true) === true) ||
                            (this.options.mode === ScriptMode.pokerus && RouteHelper.minPokerus(pkmList) === GameConstants.Pokerus.Resistant)
                        )
                            continue;
                        pkmList.forEach((pkm) => {
                            let hpkm = PokemonHelper.getPokemonByName(pkm);
                            let ppkm = App.game.party.getPokemon(hpkm.id);
                            if (
                                ppkm &&
                                ((this.options.mode === ScriptMode.shiny && ppkm?.shiny === false) ||
                                    (this.options.mode === ScriptMode.pokerus && ppkm?.pokerus === GameConstants.Pokerus.Contagious))
                            ) {
                                pkmListTotal.push(pkm);
                                pkmListFarm.push(pkm);
                                output.push({ region: rg, dungeon: dgs[j], id: hpkm.id, name: pkm, shiny: ppkm.shiny, evs: ppkm.evs() });
                                if (++nb > max) {
                                    max = nb;
                                    best = `${rg} > ${dgs[j]} => ${max} [${pkmListFarm.join(', ')}]`;
                                    this.setAreaToFarm(AreaType.dungeon, player.region, 0, 0, dgs[j]);
                                }
                            }
                        });
                    }
                }
            }
            pkmListTotal = [...new Set(pkmListTotal)];
            if (pkmListTotal.length === 0 && this.areaToFarm.until === 0) return false;
            let curMax = 500;
            switch (this.options.mode) {
                case ScriptMode.pokerus:
                    this.areaToFarm.until = App.game.party.caughtPokemon.filter((p) => p.pokerus >= GameConstants.Pokerus.Resistant).length + max;
                    curMax = App.game.party.caughtPokemon.filter((p) => p.pokerus >= GameConstants.Pokerus.Resistant).length + pkmListTotal.length;
                    break;
                case ScriptMode.shiny:
                    this.areaToFarm.until = App.game.party.caughtPokemon.filter((p) => p.shiny === true).length + max;
                    curMax = App.game.party.caughtPokemon.filter((p) => p.shiny === true).length + pkmListTotal.length;
                    break;
                default:
                    this.areaToFarm.until = this.options.dungeon.defeat;
                    break;
            }
            if (this.options.outputAreas === true) this.printArr(output);
            if (this.options.outputListPkm === true) this.printArr(pkmListTotal);
            if (!this.objectEqual(this.areaToFarm, this.areaToFarmOld)) this.print(`${best} (${this.areaToFarm.until}[${curMax}])`, DebugLevel.log);
            return true;
        }

        checkGym(allOpt: boolean = this.options.gym.all): boolean {
            this.setAreaToFarm();
            let best = '';
            if (allOpt === true) {
                for (let i = 0; i <= player.highestRegion(); i++) {
                    let rg = this.capitalize(GameConstants.Region[i]);
                    let gym = GameConstants.RegionGyms[i];
                    for (let j = 0; j < gym.length; j++) {
                        if (GymList[gym[j]].isUnlocked() === false || !GymList[gym[j]]?.parent?.name) continue;
                        if (App.game.statistics.gymsDefeated[GameConstants.getGymIndex(gym[j])]() < this.options.gym.defeat) {
                            this.setAreaToFarm(AreaType.gym, i, 0, 0, GymList[gym[j]].parent.name, gym[j], this.options.gym.defeat);
                            best = `${rg} > ${gym[j]}`;
                            break;
                        }
                    }
                }
            } else {
                let rg = this.capitalize(GameConstants.Region[player.region]);
                let gym = GameConstants.RegionGyms[player.region];
                for (let j = 0; j < gym.length; j++) {
                    if (GymList[gym[j]].isUnlocked() === false || !GymList[gym[j]]?.parent?.name) continue;
                    if (App.game.statistics.gymsDefeated[GameConstants.getGymIndex(gym[j])]() < this.options.gym.defeat) {
                        this.setAreaToFarm(AreaType.gym, player.region, 0, 0, GymList[gym[j]].parent.name, gym[j], this.options.gym.defeat);
                        best = `${rg} > ${gym[j]}`;
                        break;
                    }
                }
            }
            if (this.areaToFarm.until === 0) return false;
            let curMax = 1000;
            if (!this.objectEqual(this.areaToFarm, this.areaToFarmOld)) this.print(`${best} (${this.areaToFarm.until}[${curMax}])`, DebugLevel.log);
            return true;
        }

        checkRoad(allOpt: boolean = this.options.road.all): boolean {
            this.setAreaToFarm();
            let max = 0;
            let best = '';
            let pkmListTotal = Array<String>();
            let output = Array<{ region: string; road: string; id: number; name: PokemonNameType; shiny: boolean; evs: number }>();
            if (allOpt === true) {
                for (let i = 0; i <= player.highestRegion(); i++) {
                    let rg = this.capitalize(GameConstants.Region[i]);
                    Routes.getRoutesByRegion(i).some((rt) => {
                        if (rt.isUnlocked() === false) return false;
                        if (this.options.mode === ScriptMode.defeat) {
                            if (App.game.statistics.routeKills[i][rt.number]() < this.options.road.defeat) {
                                this.setAreaToFarm(AreaType.road, i, rt.subRegion, rt.number, '', '', this.options.road.defeat);
                                best = `${rg} > ${rt.routeName}`;
                                return true;
                            }
                        } else {
                            let nb = 0;
                            let pkmList = this.concatPkmListFromRoute(rt);
                            let pkmListFarm = Array<String>();
                            if (
                                (this.options.mode === ScriptMode.shiny && RouteHelper.routeCompleted(rt.number, i, true) === true) ||
                                (this.options.mode === ScriptMode.pokerus && RouteHelper.minPokerus(pkmList) === GameConstants.Pokerus.Resistant)
                            )
                                return false;
                            pkmList.forEach((pkm) => {
                                let hpkm = PokemonHelper.getPokemonByName(pkm);
                                let ppkm = App.game.party.getPokemon(hpkm.id);
                                if (
                                    ppkm &&
                                    ((this.options.mode === ScriptMode.shiny && ppkm?.shiny === false) ||
                                        (this.options.mode === ScriptMode.pokerus && ppkm?.pokerus === GameConstants.Pokerus.Contagious))
                                ) {
                                    pkmListTotal.push(pkm);
                                    pkmListFarm.push(pkm);
                                    output.push({ region: rg, road: rt.routeName, id: hpkm.id, name: pkm, shiny: ppkm.shiny, evs: ppkm.evs() });
                                    if (++nb > max) {
                                        max = nb;
                                        best = `${rg} > ${rt.routeName} => ${max} [${pkmListFarm.join(', ')}]`;
                                        this.setAreaToFarm(AreaType.road, i, rt.subRegion, rt.number);
                                    }
                                }
                            });
                        }
                        return false;
                    });
                }
            } else {
                let rg = this.capitalize(GameConstants.Region[player.region]);
                Routes.getRoutesByRegion(player.region).some((rt) => {
                    if (rt.isUnlocked() === false) return false;
                    if (this.options.mode === ScriptMode.defeat) {
                        if (App.game.statistics.routeKills[player.region][rt.number]() < this.options.road.defeat) {
                            this.setAreaToFarm(AreaType.road, player.region, rt.subRegion, rt.number, '', '', this.options.road.defeat);
                            best = `${rg} > ${rt.routeName}`;
                            return true;
                        }
                    } else {
                        let nb = 0;
                        let pkmList = this.concatPkmListFromRoute(rt);
                        let pkmListFarm = Array<String>();
                        if (
                            (this.options.mode === ScriptMode.shiny && RouteHelper.routeCompleted(rt.number, player.region, true) === true) ||
                            (this.options.mode === ScriptMode.pokerus && RouteHelper.minPokerus(pkmList) === GameConstants.Pokerus.Resistant)
                        )
                            return false;
                        pkmList.forEach((pkm) => {
                            let hpkm = PokemonHelper.getPokemonByName(pkm);
                            let ppkm = App.game.party.getPokemon(hpkm.id);
                            if (
                                ppkm &&
                                ((this.options.mode === ScriptMode.shiny && ppkm?.shiny === false) ||
                                    (this.options.mode === ScriptMode.pokerus && ppkm?.pokerus === GameConstants.Pokerus.Contagious))
                            ) {
                                pkmListTotal.push(pkm);
                                pkmListFarm.push(pkm);
                                output.push({ region: rg, road: rt.routeName, id: hpkm.id, name: pkm, shiny: ppkm.shiny, evs: ppkm.evs() });
                                if (++nb > max) {
                                    max = nb;
                                    best = `${rg} > ${rt.routeName} => ${max} [${pkmListFarm.join(', ')}]`;
                                    this.setAreaToFarm(AreaType.road, player.region, rt.subRegion, rt.number);
                                }
                            }
                        });
                    }
                    return false;
                });
            }
            pkmListTotal = [...new Set(pkmListTotal)];
            if (pkmListTotal.length === 0 && this.areaToFarm.until === 0) return false;
            let curMax = 10000;
            switch (this.options.mode) {
                case ScriptMode.pokerus:
                    this.areaToFarm.until = App.game.party.caughtPokemon.filter((p) => p.pokerus >= GameConstants.Pokerus.Resistant).length + max;
                    curMax = App.game.party.caughtPokemon.filter((p) => p.pokerus >= GameConstants.Pokerus.Resistant).length + pkmListTotal.length;
                    break;
                case ScriptMode.shiny:
                    this.areaToFarm.until = App.game.party.caughtPokemon.filter((p) => p.shiny === true).length + max;
                    curMax = App.game.party.caughtPokemon.filter((p) => p.shiny === true).length + pkmListTotal.length;
                    break;
                default:
                    this.areaToFarm.until = this.options.road.defeat;
                    break;
            }
            if (this.options.outputAreas === true) this.printArr(output);
            if (this.options.outputListPkm === true) this.printArr(pkmListTotal);
            if (!this.objectEqual(this.areaToFarm, this.areaToFarmOld)) this.print(`${best} (${this.areaToFarm.until}[${curMax}])`, DebugLevel.log);
            return true;
        }

        concatPkmListFromDungeon(dungeon: Dungeon): Array<PokemonNameType> {
            return dungeon.allAvailablePokemon();
        }

        concatPkmListFromRoute(route: RegionRoute): Array<PokemonNameType> {
            return RouteHelper.getAvailablePokemonList(route.number, route.region);
        }

        getEfficiency(p: PartyPokemon): number {
            const BREEDING_ATTACK_BONUS = 25;
            return (p.baseAttack * (BREEDING_ATTACK_BONUS / 100) + p.totalVitaminsUsed()) / pokemonMap[p.name].eggCycles;
        }

        moveTo(): void {
            if (this.areaToFarm.region === 6) {
                player.subregion = this.areaToFarm.subregion;
            }
            if (this.areaToFarm.route !== 0) {
                MapHelper.moveToRoute(this.areaToFarm.route, this.areaToFarm.region);
            } else if (this.areaToFarm.town !== '') {
                player.region = this.areaToFarm.region;
                MapHelper.moveToTown(this.areaToFarm.town);
                if (this.areaToFarm.areaType === AreaType.gym) {
                    if (player.town().name === this.areaToFarm.town) {
                        for (const gym of player.town().content) {
                            if (gym instanceof Champion || gym instanceof Gym) {
                                if (gym.town === this.areaToFarm.gym && App.game.gameState !== GameConstants.GameState.gym) {
                                    gym.protectedOnclick();
                                }
                            }
                        }
                    }
                }
            }
        }

        objectEqual(obj1: Object, obj2: Object): boolean {
            return (
                Object.keys(obj1).length === Object.keys(obj2).length &&
                (Object.keys(obj1) as (keyof typeof obj1)[]).every((key) => {
                    return Object.prototype.hasOwnProperty.call(obj2, key) && obj1[key] === obj2[key];
                })
            );
        }

        pkdxTopEff(
            topOpt: number = this.defaultNumberPkdxEff
        ): { id: number; name: PokemonNameType; efficiency: number; evs: number; evdmg: number; hatched: number }[] {
            let listPkm = [];
            for (const pokemon of pokemonList) {
                if ((pokemon.nativeRegion || GameConstants.Region.none) <= player.highestRegion()) {
                    let ppkm = App.game.party.getPokemon(pokemon.id);
                    if (ppkm)
                        listPkm.push({
                            id: ppkm.id,
                            name: ppkm.name,
                            efficiency: this.getEfficiency(ppkm),
                            evs: ppkm.evs(),
                            evdmg: ppkm.calculateEVAttackBonus(),
                            hatched: App.game.statistics.pokemonHatched[ppkm.id]() || 0,
                        });
                }
            }
            listPkm.sort(function sortFn(a, b) {
                if (a.efficiency === b.efficiency) {
                    return a.id > b.id ? -1 : 1;
                } else {
                    return a.efficiency > b.efficiency ? -1 : 1;
                }
            });
            listPkm = listPkm.slice(0, topOpt);
            if (this.options.outputListPkm === true) this.printArr(listPkm);
            return listPkm;
        }

        print(text: string, debugLevel: DebugLevel = DebugLevel.debug): void {
            if (!text || debugLevel < this.options.debugLevel) return;

            let date: string = new Date().toLocaleString();
            switch (debugLevel) {
                case DebugLevel.debug:
                    console.debug(`${date} - ${text}`);
                    break;
                case DebugLevel.log:
                    console.log(`${date} - ${text}`);
                    break;
                case DebugLevel.warn:
                    console.warn(`${date} - ${text}`);
                    break;
                case DebugLevel.err:
                    console.error(`${date} - ${text}`);
                    break;
                default:
                    break;
            }
        }

        printArr(arr: any[], debugLevel: DebugLevel = DebugLevel.debug): void {
            if (!arr || debugLevel < this.options.debugLevel) return;
            console.table(arr);
        }

        reset(): void {
            this.stop = false;
            this.setAreaToFarm();
            this.areaToFarmOld = this.areaToFarm;
        }

        routeMaxHP(route: RegionRoute): number {
            var result: number = -1;
            var pkmList = this.concatPkmListFromRoute(route);

            var totalBaseHp = 0;
            this.concatPkmListFromRoute(route).forEach((pnt) => {
                totalBaseHp += pokemonMap[pnt].base.hitpoints;
            });
            var avgHP = totalBaseHp / pkmList.length;

            var routeHP = PokemonFactory.routeHealth(route.number, route.region);

            pkmList.forEach((pnt) => {
                let maxHealth: number = Math.round(routeHP - routeHP / 10 + (routeHP / 10 / avgHP) * PokemonHelper.getPokemonByName(pnt).hitpoints);
                if (maxHealth > result) result = maxHealth;
            });

            return result;
        }

        run(): void {
            this.setAreaToFarm();
            var res = this.check();
            while (res === AreaType.none) {
                this.updateMode();
                res = this.check();
            }
            if (res !== AreaType.none) this.moveTo();
            if (res === AreaType.dungeon) this.startAutoDungeon();
            if (res === AreaType.gym) this.startAutoGym();
            if (res > AreaType.none) this.auto();
        }

        setAreaToFarm(
            areaType: AreaType = AreaType.none,
            region: number = 0,
            subregion: number = 0,
            route: number = 0,
            town: string = '',
            gym: string = '',
            until: number = 0
        ): void {
            this.areaToFarm = {
                areaType: areaType,
                region: region,
                route: route,
                subregion: subregion,
                town: town,
                gym: gym,
                until: until,
            };
        }

        start(): void {
            this.reset();
            this.run();
            this.areaToFarmOld = this.areaToFarm;
        }

        startAutoDungeon(): boolean {
            let autoDungeon = document.getElementById('auto-dungeon-start');
            if (autoDungeon && !autoDungeon.classList.contains('btn-success')) {
                autoDungeon.click();
                return true;
            }
            return false;
        }

        startAutoGym(): boolean {
            let autoGym = document.getElementById('auto-gym-start');
            if (autoGym && !autoGym.classList.contains('btn-success')) {
                autoGym.click();
                return true;
            }
            return false;
        }

        stopAutoDungeon(): boolean {
            let autoDungeon = document.getElementById('auto-dungeon-start');
            if (autoDungeon && !autoDungeon.classList.contains('btn-danger')) {
                autoDungeon.click();
                // DungeonRunner.dungeonLeave()
                DungeonRunner.dungeonFinished(true);
                DungeonRunner.fighting(false);
                DungeonRunner.fightingBoss(false);
                MapHelper.moveToTown(DungeonRunner.dungeon.name);
                return true;
            }
            return false;
        }

        stopAutoGym(): boolean {
            let autoGym = document.getElementById('auto-gym-start');
            if (autoGym && !autoGym.classList.contains('btn-danger')) {
                autoGym.click();
                return true;
            }
            return false;
        }

        updateMode(): void {
            switch (this.options.mode) {
                case ScriptMode.defeat:
                    if (this.options.road.skip === false && this.options.road.defeat < 10000) {
                        this.options.road.defeat *= 10;
                    } else if (this.options.dungeon.skip === false && this.options.dungeon.defeat < 500) {
                        switch (this.options.dungeon.defeat) {
                            case 10:
                                this.options.dungeon.defeat = 100;
                                break;
                            case 100:
                                this.options.dungeon.defeat = 250;
                                break;
                            case 250:
                                this.options.dungeon.defeat = 500;
                                break;
                        }
                    } else if (this.options.gym.skip === false && this.options.gym.defeat < 1000) {
                        this.options.gym.defeat *= 10;
                    } else {
                        this.options.mode = ScriptMode.shiny;
                    }
                    break;
                case ScriptMode.shiny:
                    this.options.mode = ScriptMode.pokerus;
                    break;
                case ScriptMode.pokerus:
                default:
                    // if (this.updateWeather() === false)
                    this.options.end = this.options.defaultEnd;
                    break;
            }
            this.print(
                `AreaDestroyer updateMode > mode:${this.options.mode}; road.defeat:${this.options.road.defeat}; dungeon.defeat:${this.options.dungeon.defeat}; gym.defeat:${this.options.gym.defeat}; end:${this.options.end}`,
                DebugLevel.log
            );
        }

        updateWeather(): boolean {
            var weather = document.getElementById('weather-select') as HTMLSelectElement;
            if (weather) {
                if (weather.selectedIndex < weather.options.length - 1) {
                    weather.selectedIndex++;
                } else {
                    weather.selectedIndex = 0;
                }
                weather.dispatchEvent(new Event('click'));
                this.print(`Weather updated: ${weather.options[weather.selectedIndex].innerText}`);
                return weather.selectedIndex !== 0;
            }
            return false;
        }
    }
}

var ad = new AreaDestroyer.AreaDestroyer();
ad.start();
// ad.stop = true;

var ad2 = new AreaDestroyer.AreaDestroyer();
ad2.options.outputListPkm = false;
// ad2.options.dungeon.all = false;
// ad2.options.gym.all = false;
// ad2.options.road.all = false;
ad2.options.debugLevel = AreaDestroyer.DebugLevel.debug;
ad2.options.mode = AreaDestroyer.ScriptMode.pokerus;
// ad2.checkRoad(); ad2.checkDungeon()
// ad2.checkRoad(true); ad2.checkDungeon(true)
