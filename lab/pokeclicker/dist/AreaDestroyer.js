/**
 * @name:         AreaDestroyer
 * @author:       kevingrillet
 * @description:  Clear areas (roads/dungeons/gym) by doing Achievements, Catch Shiny, farm Evs (need PRKS ofc). Story need to be complete for every regions you want to farm.
 * @license:      GPL-3.0 License
 * @version:      1.0.6
 *
 * @required:     https://github.com/Ephenia/Pokeclicker-Scripts (Enhanced Auto Clicker) with AutoClick [ON]
 */
var AreaDestroyer;
(function (AreaDestroyer_1) {
    let EndType;
    (function (EndType) {
        EndType[EndType["none"] = 0] = "none";
        EndType[EndType["evs"] = 1] = "evs";
        EndType[EndType["steps"] = 2] = "steps";
    })(EndType = AreaDestroyer_1.EndType || (AreaDestroyer_1.EndType = {}));
    let Mode;
    (function (Mode) {
        Mode[Mode["defeat"] = 0] = "defeat";
        Mode[Mode["shiny"] = 1] = "shiny";
        Mode[Mode["pokerus"] = 2] = "pokerus";
    })(Mode = AreaDestroyer_1.Mode || (AreaDestroyer_1.Mode = {}));
    let ShowDebug;
    (function (ShowDebug) {
        ShowDebug[ShowDebug["debug"] = 0] = "debug";
        ShowDebug[ShowDebug["log"] = 1] = "log";
        ShowDebug[ShowDebug["warn"] = 2] = "warn";
        ShowDebug[ShowDebug["err"] = 3] = "err";
    })(ShowDebug = AreaDestroyer_1.ShowDebug || (AreaDestroyer_1.ShowDebug = {}));
    let Type;
    (function (Type) {
        Type[Type["none"] = 0] = "none";
        Type[Type["road"] = 1] = "road";
        Type[Type["dungeon"] = 2] = "dungeon";
        Type[Type["gym"] = 3] = "gym";
    })(Type = AreaDestroyer_1.Type || (AreaDestroyer_1.Type = {}));
    class AreaToFarm {
        constructor() {
            this.region = 0;
            this.route = 0;
            this.subregion = 0;
            this.type = Type.none;
            this.town = '';
            this.gym = '';
            this.until = 0;
        }
    }
    class AreaOptions {
        constructor(defeat = 0, all = true, boss = false, skip = false) {
            this.all = all;
            this.boss = boss;
            this.defeat = defeat;
            this.skip = skip;
        }
    }
    class Options {
        constructor() {
            this.both = false;
            this.dungeon = new AreaOptions(10);
            this.end = EndType.none;
            this.gym = new AreaOptions(10);
            this.mode = Mode.defeat;
            this.road = new AreaOptions(100);
            this.showDebug = ShowDebug.log;
            this.timeout = 60;
        }
    }
    class AreaDestroyer {
        constructor() {
            this.stop = false;
            this.options = new Options();
            this.areaToFarm = new AreaToFarm();
            this.elPlayer = document.getElementById('AreaDestroyerAudio') || document.createElement('audio');
            this.elPlayer.setAttribute('id', 'AreaDestroyerAudio');
            this.elPlayer.src = 'https://raw.githubusercontent.com/kevingrillet/Userscripts/main/assets/my-work-is-done.mp3';
        }
        capitalize(text) {
            return text.charAt(0).toUpperCase() + text.slice(1);
        }
        chekDone() {
            var _a;
            switch (this.options.mode) {
                case Mode.pokerus:
                    switch (this.areaToFarm.type) {
                        case Type.dungeon:
                            return RouteHelper.minPokerus(((_a = player.town().dungeon) === null || _a === void 0 ? void 0 : _a.allAvailablePokemon()) || []) === 3;
                        case Type.road:
                            return RouteHelper.minPokerus(RouteHelper.getAvailablePokemonList(player.route(), player.region, true)) === 3;
                    }
                    break;
                case Mode.shiny:
                    switch (this.areaToFarm.type) {
                        case Type.dungeon:
                            return DungeonRunner.dungeonCompleted(player.town().dungeon, true);
                        case Type.road:
                            return RouteHelper.routeCompleted(player.route(), player.region, true);
                    }
                    break;
            }
            return false;
        }
        concatPkmListFromDungeon(dungeon) {
            return dungeon.allAvailablePokemon();
        }
        concatPkmListFromRoute(route) {
            return RouteHelper.getAvailablePokemonList(route.number, route.region);
        }
        getEfficiency(p) {
            const BREEDING_ATTACK_BONUS = 25;
            return (p.baseAttack * (BREEDING_ATTACK_BONUS / 100) + p.proteinsUsed()) / pokemonMap[p.name].eggCycles;
        }
        moveTo() {
            if (this.areaToFarm.region === 6) {
                player.subregion = this.areaToFarm.subregion;
            }
            if (this.areaToFarm.route !== 0) {
                MapHelper.moveToRoute(this.areaToFarm.route, this.areaToFarm.region);
            }
            else if (this.areaToFarm.town !== '') {
                player.region = this.areaToFarm.region;
                MapHelper.moveToTown(this.areaToFarm.town);
                if (this.areaToFarm.type === Type.gym) {
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
        pkdxTopEff(topOpt) {
            let listPkm = [];
            for (const pokemon of pokemonList) {
                if ((pokemon.nativeRegion || GameConstants.Region.none) <= player.highestRegion()) {
                    let ppkm = App.game.party.getPokemon(pokemon.id);
                    if (ppkm)
                        listPkm.push({ id: ppkm.id, name: ppkm.name, efficiency: this.getEfficiency(ppkm), evs: ppkm.evs() });
                }
            }
            listPkm.sort(function sortFn(a, b) {
                if (a.efficiency === b.efficiency) {
                    return a.id > b.id ? -1 : 1;
                }
                else {
                    return a.efficiency > b.efficiency ? -1 : 1;
                }
            });
            listPkm = listPkm.slice(0, topOpt || 10);
            this.printArr(listPkm, ShowDebug.log);
            return listPkm;
        }
        print(text, debugLevel = ShowDebug.debug) {
            if (!text || debugLevel < this.options.showDebug)
                return;
            let date = new Date().toLocaleString();
            switch (debugLevel) {
                case ShowDebug.debug:
                    console.debug(date);
                    console.debug(text);
                    break;
                case ShowDebug.log:
                    console.log(`${date} - ${text}`);
                    break;
                case ShowDebug.warn:
                    console.warn(`${date} - ${text}`);
                    break;
                case ShowDebug.err:
                    console.error(`${date} - ${text}`);
                    break;
                default:
                    break;
            }
        }
        printArr(arr, debugLevel = ShowDebug.debug) {
            if (!arr || debugLevel < this.options.showDebug)
                return;
            console.table(arr);
        }
        routeMaxHP(route) {
            var result = -1;
            var pkmList = this.concatPkmListFromRoute(route);
            var totalBaseHp = 0;
            this.concatPkmListFromRoute(route).forEach((pnt) => {
                totalBaseHp += pokemonMap[pnt].base.hitpoints;
            });
            var avgHP = totalBaseHp / pkmList.length;
            var routeHP = PokemonFactory.routeHealth(route.number, route.region);
            pkmList.forEach((pnt) => {
                let maxHealth = Math.round(routeHP - routeHP / 10 + (routeHP / 10 / avgHP) * PokemonHelper.getPokemonByName(pnt).hitpoints);
                if (maxHealth > result)
                    result = maxHealth;
            });
            return result;
        }
        setAreaToFarm(type = Type.none, region = 0, subregion = 0, route = 0, town = '', gym = '', until = 0) {
            this.areaToFarm = {
                type: type,
                region: region,
                route: route,
                subregion: subregion,
                town: town,
                gym: gym,
                until: until,
            };
        }
        startAutoDungeon() {
            let autoDungeon = document.getElementById('auto-dungeon-start');
            if (autoDungeon && !autoDungeon.classList.contains('btn-success')) {
                autoDungeon.click();
                return true;
            }
            return false;
        }
        startAutoGym() {
            let autoGym = document.getElementById('auto-gym-start');
            if (autoGym && !autoGym.classList.contains('btn-success')) {
                autoGym.click();
                return true;
            }
            return false;
        }
        stopAutoDungeon() {
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
        stopAutoGym() {
            let autoGym = document.getElementById('auto-gym-start');
            if (autoGym && !autoGym.classList.contains('btn-danger')) {
                autoGym.click();
                return true;
            }
            return false;
        }
        updateMode() {
            switch (this.options.mode) {
                case Mode.defeat:
                    if (this.options.road.skip === false && this.options.road.defeat < 10000) {
                        this.options.road.defeat *= 10;
                    }
                    else if (this.options.dungeon.skip === false && this.options.dungeon.defeat < 500) {
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
                    }
                    else if (this.options.gym.skip === false && this.options.gym.defeat < 1000) {
                        this.options.gym.defeat *= 10;
                    }
                    else {
                        this.options.mode = Mode.shiny;
                    }
                    break;
                case Mode.shiny:
                    this.options.mode = Mode.pokerus;
                    break;
                case Mode.pokerus:
                default:
                    this.options.end = EndType.evs;
                    break;
            }
            this.print(`AreaDestroyer updateMode > mode:${this.options.mode}; road.defeat:${this.options.road.defeat}; dungeon.defeat:${this.options.dungeon.defeat}; gym.defeat:${this.options.gym.defeat}; end:${this.options.end}`, 1);
        }
        calcDungeon(allOpt = this.options.dungeon.all) {
            let max = 0;
            let best = '';
            let pkmListTotal = Array();
            let output = `Region; Road; Id; Pokemon; Shiny; EVs \n`;
            if (allOpt === true) {
                for (let i = 0; i <= player.highestRegion(); i++) {
                    let rg = this.capitalize(GameConstants.Region[i]);
                    let dgs = GameConstants.RegionDungeons[i];
                    for (let j = 0; j < dgs.length; j++) {
                        if (dungeonList[dgs[j]].isUnlocked() === false)
                            continue;
                        if (this.options.mode === Mode.defeat) {
                            if (App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(dgs[j])]() < this.options.dungeon.defeat) {
                                this.setAreaToFarm(Type.dungeon, i, 0, 0, dgs[j], '', this.options.dungeon.defeat);
                                best = `${rg} > ${dgs[j]}`;
                                break;
                            }
                        }
                        else {
                            let nb = 0;
                            this.concatPkmListFromDungeon(dungeonList[dgs[j]]).forEach((pkm) => {
                                let hpkm = PokemonHelper.getPokemonByName(pkm);
                                let ppkm = App.game.party.getPokemon(hpkm.id);
                                if (ppkm &&
                                    ((this.options.mode === Mode.shiny && (ppkm === null || ppkm === void 0 ? void 0 : ppkm.shiny) === false) || (this.options.mode === Mode.pokerus && (ppkm === null || ppkm === void 0 ? void 0 : ppkm.pokerus) === 2))) {
                                    pkmListTotal.push(pkm);
                                    output += `${rg}; ${dgs[j]}; ${hpkm.id}; ${pkm}; ${ppkm.shiny}; ${ppkm.evs()}\n`;
                                    if (++nb > max) {
                                        max = nb;
                                        best = `${rg} > ${dgs[j]} => ${max}`;
                                        this.setAreaToFarm(Type.dungeon, i, 0, 0, dgs[j]);
                                    }
                                }
                            });
                        }
                    }
                }
            }
            else {
                let rg = this.capitalize(GameConstants.Region[player.region]);
                let dgs = GameConstants.RegionDungeons[player.region];
                for (let j = 0; j < dgs.length; j++) {
                    if (dungeonList[dgs[j]].isUnlocked() === false)
                        continue;
                    if (this.options.mode === Mode.defeat) {
                        if (App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(dgs[j])]() < this.options.dungeon.defeat) {
                            this.setAreaToFarm(Type.dungeon, player.region, 0, 0, dgs[j], '', this.options.dungeon.defeat);
                            best = `${rg} > ${dgs[j]}`;
                            break;
                        }
                    }
                    else {
                        let nb = 0;
                        this.concatPkmListFromDungeon(dungeonList[dgs[j]]).forEach((pkm) => {
                            let hpkm = PokemonHelper.getPokemonByName(pkm);
                            let ppkm = App.game.party.getPokemon(hpkm.id);
                            if (ppkm &&
                                ((this.options.mode === Mode.shiny && (ppkm === null || ppkm === void 0 ? void 0 : ppkm.shiny) === false) || (this.options.mode === Mode.pokerus && (ppkm === null || ppkm === void 0 ? void 0 : ppkm.pokerus) === 2))) {
                                pkmListTotal.push(pkm);
                                output += `${rg}; ${dgs[j]}; ${hpkm.id}; ${pkm}; ${ppkm.shiny}; ${ppkm.evs()}\n`;
                                if (++nb > max) {
                                    max = nb;
                                    best = `${rg} > ${dgs[j]} => ${max}`;
                                    this.setAreaToFarm(Type.dungeon, player.region, 0, 0, dgs[j]);
                                }
                            }
                        });
                    }
                }
            }
            pkmListTotal = [...new Set(pkmListTotal)];
            if (pkmListTotal.length === 0 && this.areaToFarm.until === 0)
                return false;
            let curMax = 500;
            switch (this.options.mode) {
                case Mode.pokerus:
                    this.areaToFarm.until = App.game.party.caughtPokemon.filter((p) => p.pokerus >= GameConstants.Pokerus.Resistant).length + max;
                    curMax = App.game.party.caughtPokemon.filter((p) => p.pokerus >= GameConstants.Pokerus.Resistant).length + pkmListTotal.length;
                    break;
                case Mode.shiny:
                    this.areaToFarm.until = App.game.party.caughtPokemon.filter((p) => p.shiny === true).length + max;
                    curMax = App.game.party.caughtPokemon.filter((p) => p.shiny === true).length + pkmListTotal.length;
                    break;
                default:
                    this.areaToFarm.until = this.options.dungeon.defeat;
                    break;
            }
            this.print(output);
            this.printArr(pkmListTotal);
            this.print(`${best} (${this.areaToFarm.until}[${curMax}])`, 1);
            return true;
        }
        calcGym(allOpt = this.options.gym.all) {
            var _a, _b, _c, _d;
            let best = '';
            if (allOpt === true) {
                for (let i = 0; i <= player.highestRegion(); i++) {
                    let rg = this.capitalize(GameConstants.Region[i]);
                    let gym = GameConstants.RegionGyms[i];
                    for (let j = 0; j < gym.length; j++) {
                        if (GymList[gym[j]].isUnlocked() === false || !((_b = (_a = GymList[gym[j]]) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.name))
                            continue;
                        if (App.game.statistics.gymsDefeated[GameConstants.getGymIndex(gym[j])]() < this.options.gym.defeat) {
                            this.setAreaToFarm(Type.gym, i, 0, 0, GymList[gym[j]].parent.name, gym[j], this.options.gym.defeat);
                            best = `${rg} > ${gym[j]}`;
                            break;
                        }
                    }
                }
            }
            else {
                let rg = this.capitalize(GameConstants.Region[player.region]);
                let gym = GameConstants.RegionGyms[player.region];
                for (let j = 0; j < gym.length; j++) {
                    if (GymList[gym[j]].isUnlocked() === false || !((_d = (_c = GymList[gym[j]]) === null || _c === void 0 ? void 0 : _c.parent) === null || _d === void 0 ? void 0 : _d.name))
                        continue;
                    if (App.game.statistics.gymsDefeated[GameConstants.getGymIndex(gym[j])]() < this.options.gym.defeat) {
                        this.setAreaToFarm(Type.gym, player.region, 0, 0, GymList[gym[j]].parent.name, gym[j], this.options.gym.defeat);
                        best = `${rg} > ${gym[j]}`;
                        break;
                    }
                }
            }
            if (this.areaToFarm.until === 0)
                return false;
            let curMax = 1000;
            this.print(`${best} (${this.areaToFarm.until}[${curMax}])`, 1);
            return true;
        }
        calcRoad(allOpt = this.options.road.all) {
            let max = 0;
            let best = '';
            let pkmListTotal = Array();
            let output = `Region; Road; Id; Pokemon; Shiny; EVs \n`;
            if (allOpt === true) {
                for (let i = 0; i <= player.highestRegion(); i++) {
                    let rg = this.capitalize(GameConstants.Region[i]);
                    Routes.getRoutesByRegion(i).some((rt) => {
                        if (rt.isUnlocked() === false)
                            return false;
                        if (this.options.mode === Mode.defeat) {
                            if (App.game.statistics.routeKills[i][rt.number]() < this.options.road.defeat) {
                                this.setAreaToFarm(Type.road, i, rt.subRegion, rt.number, '', '', this.options.road.defeat);
                                output += `${rg}; ${rt.routeName}; ; ; ;\n`;
                                best = `${rg} > ${rt.routeName}`;
                                return true;
                            }
                        }
                        else {
                            let nb = 0;
                            this.concatPkmListFromRoute(rt).forEach((pkm) => {
                                let hpkm = PokemonHelper.getPokemonByName(pkm);
                                let ppkm = App.game.party.getPokemon(hpkm.id);
                                if (ppkm &&
                                    ((this.options.mode === Mode.shiny && (ppkm === null || ppkm === void 0 ? void 0 : ppkm.shiny) === false) || (this.options.mode === Mode.pokerus && (ppkm === null || ppkm === void 0 ? void 0 : ppkm.pokerus) === 2))) {
                                    pkmListTotal.push(pkm);
                                    output += `${rg}; ${rt.routeName}; ${hpkm.id}; ${pkm}; ${ppkm.shiny}; ${ppkm.evs()}\n`;
                                    if (++nb > max) {
                                        max = nb;
                                        best = `${rg} > ${rt.routeName} => ${max}`;
                                        this.setAreaToFarm(Type.road, i, rt.subRegion, rt.number);
                                    }
                                }
                            });
                        }
                        return false;
                    });
                }
            }
            else {
                let rg = this.capitalize(GameConstants.Region[player.region]);
                Routes.getRoutesByRegion(player.region).forEach((rt) => {
                    if (rt.isUnlocked() === false)
                        return false;
                    if (this.options.mode === Mode.defeat) {
                        if (App.game.statistics.routeKills[player.region][rt.number]() < this.options.road.defeat) {
                            this.setAreaToFarm(Type.road, player.region, rt.subRegion, rt.number, '', '', this.options.road.defeat);
                            output += `${rg}; ${rt.routeName}; ; ; ;\n`;
                            best = `${rg} > ${rt.routeName}`;
                            return true;
                        }
                    }
                    else {
                        let nb = 0;
                        this.concatPkmListFromRoute(rt).forEach((pkm) => {
                            let hpkm = PokemonHelper.getPokemonByName(pkm);
                            let ppkm = App.game.party.getPokemon(hpkm.id);
                            if (ppkm &&
                                ((this.options.mode === Mode.shiny && (ppkm === null || ppkm === void 0 ? void 0 : ppkm.shiny) === false) || (this.options.mode === Mode.pokerus && (ppkm === null || ppkm === void 0 ? void 0 : ppkm.pokerus) === 2))) {
                                pkmListTotal.push(pkm);
                                output += `${rg}; ${rt.routeName}; ${hpkm.id}; ${pkm}; ${ppkm.shiny}; ${ppkm.evs()}\n`;
                                if (++nb > max) {
                                    max = nb;
                                    best = `${rg} > ${rt.routeName} => ${max}`;
                                    this.setAreaToFarm(Type.road, player.region, rt.subRegion, rt.number);
                                }
                            }
                        });
                    }
                    return false;
                });
            }
            pkmListTotal = [...new Set(pkmListTotal)];
            if (pkmListTotal.length === 0 && this.areaToFarm.until === 0)
                return false;
            let curMax = 10000;
            switch (this.options.mode) {
                case Mode.pokerus:
                    this.areaToFarm.until = App.game.party.caughtPokemon.filter((p) => p.pokerus >= GameConstants.Pokerus.Resistant).length + max;
                    curMax = App.game.party.caughtPokemon.filter((p) => p.pokerus >= GameConstants.Pokerus.Resistant).length + pkmListTotal.length;
                    break;
                case Mode.shiny:
                    this.areaToFarm.until = App.game.party.caughtPokemon.filter((p) => p.shiny === true).length + max;
                    curMax = App.game.party.caughtPokemon.filter((p) => p.shiny === true).length + pkmListTotal.length;
                    break;
                default:
                    this.areaToFarm.until = this.options.road.defeat;
                    break;
            }
            this.print(output);
            this.printArr(pkmListTotal);
            this.print(`${best} (${this.areaToFarm.until}[${curMax}])`, 1);
            return true;
        }
        bestEvsFarm(topOpt = 10) {
            this.setAreaToFarm();
            let lst = this.pkdxTopEff(topOpt);
            let max = 0;
            let best = '';
            for (let i = 0; i <= player.highestRegion(); i++) {
                let rg = this.capitalize(GameConstants.Region[i]);
                Routes.getRoutesByRegion(i).forEach((rt) => {
                    let nb = 0;
                    let pkmListEv = Array();
                    this.concatPkmListFromRoute(rt).forEach((pkm) => {
                        if (lst.find((e) => e.name === pkm)) {
                            pkmListEv.push(pkm);
                            if (++nb >= max) {
                                max = nb;
                                best = `${rg} > ${rt.routeName} => ${max} ${pkmListEv}`;
                                this.areaToFarm.region = i;
                                this.areaToFarm.route = rt.number;
                                this.areaToFarm.subregion = (rt === null || rt === void 0 ? void 0 : rt.subRegion) || 0;
                            }
                        }
                    });
                });
            }
            this.print(`${best}`, 1);
        }
        bestRoadEggsBattle(attack) {
            let max = 0;
            let best = '';
            var atk = attack || App.game.party.calculateClickAttack(true);
            for (let i = 0; i <= player.highestRegion(); i++) {
                let rg = this.capitalize(GameConstants.Region[i]);
                Routes.getRoutesByRegion(i).forEach((rt) => {
                    let amount = Number(Math.sqrt(MapHelper.normalizeRoute(rt.number, rt.region)).toFixed(2));
                    let maxHp = this.routeMaxHP(rt);
                    if (amount > max && maxHp < atk) {
                        max = amount;
                        best = `${rg} > ${rt.routeName} => ${max}`;
                        this.areaToFarm.region = i;
                        this.areaToFarm.route = rt.number;
                        this.areaToFarm.subregion = (rt === null || rt === void 0 ? void 0 : rt.subRegion) || 0;
                    }
                });
            }
            this.print(`${best}`, 1);
        }
        check(bothOpt = this.options.both) {
            if (this.options.end === EndType.evs) {
                this.bestEvsFarm();
                this.moveTo();
                return -1;
            }
            if (this.options.end === EndType.steps) {
                this.bestRoadEggsBattle();
                this.moveTo();
                return -1;
            }
            if (this.options.road.skip === false) {
                if (this.calcRoad() === true && !(bothOpt === true)) {
                    return Type.road;
                }
            }
            if (this.options.dungeon.skip === false) {
                if (this.calcDungeon() === true) {
                    return Type.dungeon;
                }
            }
            if (this.options.mode === Mode.defeat && this.options.gym.skip === false) {
                if (this.calcGym() === true) {
                    return Type.gym;
                }
            }
            return Type.none;
        }
        auto() {
            setTimeout(() => {
                if (this.stop === true) {
                    this.stop = false;
                    this.print(`AreaDestroyer stopped`, 1);
                }
                else {
                    let curMax = 0;
                    switch (this.options.mode) {
                        case Mode.defeat:
                            if (this.areaToFarm.type === Type.road && this.areaToFarm.route !== 0) {
                                curMax = App.game.statistics.routeKills[this.areaToFarm.region][this.areaToFarm.route]();
                            }
                            else if (this.areaToFarm.type === Type.dungeon && this.areaToFarm.town !== '') {
                                curMax = App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(this.areaToFarm.town)]();
                            }
                            else if (this.areaToFarm.type === Type.gym && this.areaToFarm.gym !== '') {
                                curMax = App.game.statistics.gymsDefeated[GameConstants.getGymIndex(this.areaToFarm.gym)]();
                            }
                            break;
                        case Mode.pokerus:
                            curMax = App.game.party.caughtPokemon.filter((p) => p.pokerus >= GameConstants.Pokerus.Resistant).length;
                            break;
                        case Mode.shiny:
                            curMax = App.game.party.caughtPokemon.filter((p) => p.shiny === true).length;
                            break;
                    }
                    if (this.areaToFarm.until === 0 || curMax >= this.areaToFarm.until || this.chekDone() === true) {
                        if (this.areaToFarm.type === Type.dungeon) {
                            this.stopAutoDungeon();
                            this.moveTo();
                        }
                        if (this.areaToFarm.type === Type.gym) {
                            this.stopAutoGym();
                            this.moveTo();
                        }
                        this.setAreaToFarm();
                        let chkRes = this.check();
                        if (chkRes === Type.road) {
                            this.moveTo();
                            this.print(`AreaDestroyer NextArea`, 1);
                            this.auto();
                        }
                        else if (chkRes === Type.dungeon) {
                            this.moveTo();
                            if (this.startAutoDungeon() === true) {
                                this.print(`AreaDestroyer NextArea`, 1);
                                this.auto();
                            }
                            else {
                                this.print(`AreaDestroyer Failed to auto dungeon`, 2);
                            }
                        }
                        else if (chkRes === Type.gym) {
                            this.moveTo();
                            if (this.startAutoGym() === true) {
                                this.print(`AreaDestroyer NextArea`, 1);
                                this.auto();
                            }
                            else {
                                this.print(`AreaDestroyer Failed to auto dungeon`, 2);
                            }
                        }
                        else {
                            this.print(`AreaDestroyer DONE`, 1);
                            this.elPlayer.play();
                            this.updateMode();
                            this.run();
                        }
                    }
                    else {
                        this.print(`AreaDestroyer IDLE ${curMax}/${this.areaToFarm.until}`);
                        this.auto();
                    }
                }
            }, this.options.timeout * 1000);
        }
        run(bothOpt = this.options.both) {
            this.setAreaToFarm();
            var res = this.check(bothOpt);
            while (res === Type.none) {
                this.updateMode();
                res = this.check(bothOpt);
            }
            if (res !== Type.none)
                this.moveTo();
            if (res === Type.dungeon)
                this.startAutoDungeon();
            if (res === Type.gym)
                this.startAutoGym();
            if (res > Type.none)
                this.auto();
        }
    }
    AreaDestroyer_1.AreaDestroyer = AreaDestroyer;
})(AreaDestroyer || (AreaDestroyer = {}));
var ad = new AreaDestroyer.AreaDestroyer();
// ad.options.dungeon.skip = true;
// ad.options.gym.skip = true;
// ad.options.showDebug = AreaDestroyer.ShowDebug.debug;
// ad.options.mode = AreaDestroyer.Mode.pokerus;
// ad.calcRoad();
// ad.calcDungeon();
// ad.calcGym();
ad.run();
// ad.stop = true;
