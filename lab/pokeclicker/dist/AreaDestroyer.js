/**
 * @name:         AreaDestroyer
 * @author:       kevingrillet
 * @description:  Clear areas (roads/dungeons/gym) by doing Achievements, Catch Shiny, farm Evs (need PRKS ofc). Story need to be complete for every regions you want to farm.
 * @license:      GPL-3.0 License
 * @version:      0.2
 *
 * @required:     https://github.com/Ephenia/Pokeclicker-Scripts (Enhanced Auto Clicker) with AutoClick [ON]
 *
 * @tutorial:     var ad = new AreaDestroyer.AreaDestroyer(); ad.options.gym.skip = true; ad.run() //ad.stop = true
 */
var AreaDestroyer;
(function (AreaDestroyer_1) {
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
    })(Type || (Type = {}));
    class AreaToFarm {
    }
    class AreaOptions {
        constructor(defeat = 0, all = true, skip = false, special = false) {
            this.all = all;
            this.defeat = defeat;
            this.skip = skip;
            this.special = special;
        }
    }
    class Options {
        constructor() {
            this.both = false;
            this.dungeon = new AreaOptions(10);
            this.end = false;
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
            this.elPlayer = document.getElementById("AreaDestroyerAudio") || document.createElement("audio");
            this.elPlayer.setAttribute("id", "AreaDestroyerAudio");
            this.elPlayer.src = "https://raw.githubusercontent.com/kevingrillet/Userscripts/main/assets/my-work-is-done.mp3";
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
        capitalize(text) {
            return text.charAt(0).toUpperCase() + text.slice(1);
        }
        concatPkmListFromRoute(route, special = this.options.road.special) {
            let pkmList = [];
            if (special === true)
                route.pokemon.special.forEach((e) => (pkmList = [...new Set([...pkmList, ...e.pokemon])]));
            return [...new Set([...pkmList, ...route.pokemon.headbutt, ...route.pokemon.land, ...route.pokemon.water])];
        }
        setAreaToFarm(type = Type.none, region = 0, subregion = 0, route = 0, town = "", gym = "", until = 0) {
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
                    this.options.end = true;
                    break;
            }
            this.print(`AreaDestroyer updateMode > mode:${this.options.mode}; road.defeat:${this.options.road.defeat}; dungeon.defeat:${this.options.dungeon.defeat}; gym.defeat:${this.options.gym.defeat}; end:${this.options.end}`, 1);
        }
        calcRoad(allOpt = this.options.road.all, specOpt = this.options.road.special) {
            let max = 0;
            let best = "";
            let pkmListTotal = [];
            let output = `Region; Road; Id; Pokemon; Shiny; EVs \n`;
            if (allOpt === true) {
                for (let i = 0; i <= player.highestRegion(); i++) {
                    let rg = this.capitalize(GameConstants.Region[i]);
                    Routes.getRoutesByRegion(i).some((rt) => {
                        if (this.options.mode === Mode.defeat) {
                            if (App.game.statistics.routeKills[i][rt.number]() < this.options.road.defeat) {
                                this.setAreaToFarm(Type.road, i, rt.subRegion, rt.number, "", "", this.options.road.defeat);
                                output += `${rg}; ${rt.routeName}; ; ; ;\n`;
                                best = `${rg} > ${rt.routeName}`;
                                return true;
                            }
                        }
                        else {
                            let nb = 0;
                            this.concatPkmListFromRoute(rt, specOpt).forEach((pkm) => {
                                let hpkm = PokemonHelper.getPokemonByName(pkm);
                                let ppkm = App.game.party.getPokemon(hpkm.id);
                                if (ppkm &&
                                    ((this.options.mode === Mode.shiny && (ppkm === null || ppkm === void 0 ? void 0 : ppkm.shiny) === false) || (this.options.mode === Mode.pokerus && (ppkm === null || ppkm === void 0 ? void 0 : ppkm.pokerus) === 2))) {
                                    pkmListTotal.push(pkm);
                                    output += `${rg}; ${rt.routeName}; ${hpkm.id}; ${pkm}; ${pkm.shiny}; ${ppkm.evs()}\n`;
                                    if (++nb > max) {
                                        max = nb;
                                        best = `${rg} > ${rt.routeName} => ${max}`;
                                        this.setAreaToFarm(Type.road, i, rt.subRegion, rt.number);
                                    }
                                }
                            });
                        }
                    });
                }
            }
            else {
                let rg = this.capitalize(GameConstants.Region[player.region]);
                Routes.getRoutesByRegion(player.region).forEach((rt) => {
                    if (this.options.mode === Mode.defeat) {
                        if (App.game.statistics.routeKills[player.region][rt.number]() < this.options.road.defeat) {
                            this.setAreaToFarm(Type.road, player.region, rt.subRegion, rt.number, "", "", this.options.road.defeat);
                            output += `${rg}; ${rt.routeName}; ; ; ;\n`;
                            best = `${rg} > ${rt.routeName}`;
                            return true;
                        }
                    }
                    else {
                        let nb = 0;
                        this.concatPkmListFromRoute(rt, specOpt).forEach((pkm) => {
                            let hpkm = PokemonHelper.getPokemonByName(pkm);
                            let ppkm = App.game.party.getPokemon(hpkm.id);
                            if (ppkm &&
                                ((this.options.mode === Mode.shiny && (ppkm === null || ppkm === void 0 ? void 0 : ppkm.shiny) === false) || (this.options.mode === Mode.pokerus && (ppkm === null || ppkm === void 0 ? void 0 : ppkm.pokerus) === 2))) {
                                pkmListTotal.push(pkm);
                                output += `${rg}; ${rt.routeName}; ${hpkm.id}; ${pkm}; ${pkm.shiny}; ${ppkm.evs()}\n`;
                                if (++nb > max) {
                                    max = nb;
                                    best = `${rg} > ${rt.routeName} => ${max}`;
                                    this.setAreaToFarm(Type.road, player.region, rt.subRegion, rt.number);
                                }
                            }
                        });
                    }
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
        calcDungeon(allOpt = this.options.dungeon.all) {
            var _a, _b;
            let max = 0;
            let best = "";
            let pkmListTotal = [];
            let output = `Region; Road; Id; Pokemon; Shiny; EVs \n`;
            if (allOpt === true) {
                for (let i = 0; i <= player.highestRegion(); i++) {
                    let rg = this.capitalize(GameConstants.Region[i]);
                    let dgs = GameConstants.RegionDungeons[i];
                    for (let j = 0; j < dgs.length; j++) {
                        if (this.options.mode === Mode.defeat) {
                            if (App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(dgs[j])]() < this.options.dungeon.defeat) {
                                this.setAreaToFarm(Type.dungeon, i, 0, 0, dgs[j], "", this.options.dungeon.defeat);
                                best = `${rg} > ${dgs[j]}`;
                                break;
                            }
                        }
                        else {
                            let nb = 0;
                            (_a = dungeonList[dgs[j]]) === null || _a === void 0 ? void 0 : _a.pokemonList.forEach((pkm) => {
                                let hpkm = PokemonHelper.getPokemonByName(pkm);
                                let ppkm = App.game.party.getPokemon(hpkm.id);
                                if (ppkm &&
                                    ((this.options.mode === Mode.shiny && (ppkm === null || ppkm === void 0 ? void 0 : ppkm.shiny) === false) || (this.options.mode === Mode.pokerus && (ppkm === null || ppkm === void 0 ? void 0 : ppkm.pokerus) === 2))) {
                                    pkmListTotal.push(pkm);
                                    output += `${rg}; ${dgs[j]}; ${hpkm.id}; ${pkm}; ${pkm.shiny}; ${ppkm.evs()}\n`;
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
                    if (this.options.mode === Mode.defeat) {
                        if (App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(dgs[j])]() < this.options.dungeon.defeat) {
                            this.setAreaToFarm(Type.dungeon, player.region, 0, 0, dgs[j], "", this.options.dungeon.defeat);
                            best = `${rg} > ${dgs[j]}`;
                            break;
                        }
                    }
                    else {
                        let nb = 0;
                        (_b = dungeonList[dgs[j]]) === null || _b === void 0 ? void 0 : _b.pokemonList.forEach((pkm) => {
                            let hpkm = PokemonHelper.getPokemonByName(pkm);
                            let ppkm = App.game.party.getPokemon(hpkm.id);
                            if (ppkm &&
                                ((this.options.mode === Mode.shiny && (ppkm === null || ppkm === void 0 ? void 0 : ppkm.shiny) === false) || (this.options.mode === Mode.pokerus && (ppkm === null || ppkm === void 0 ? void 0 : ppkm.pokerus) === 2))) {
                                pkmListTotal.push(pkm);
                                output += `${rg}; ${dgs[j]}; ${hpkm.id}; ${pkm}; ${pkm.shiny}; ${ppkm.evs()}\n`;
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
            let best = "";
            if (allOpt === true) {
                for (let i = 0; i <= player.highestRegion(); i++) {
                    let rg = this.capitalize(GameConstants.Region[i]);
                    let gym = GameConstants.RegionGyms[i];
                    for (let j = 0; j < gym.length; j++) {
                        if (App.game.statistics.gymsDefeated[GameConstants.getGymIndex(gym[j])]() < this.options.gym.defeat) {
                            this.setAreaToFarm(Type.gym, i, 0, 0, ((_b = (_a = GymList[gym[j]]) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.name) || gym[j], gym[j], this.options.gym.defeat);
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
                    if (App.game.statistics.gymsDefeated[GameConstants.getGymIndex(gym[j])]() < this.options.gym.defeat) {
                        this.setAreaToFarm(Type.gym, player.region, 0, 0, ((_d = (_c = GymList[gym[j]]) === null || _c === void 0 ? void 0 : _c.parent) === null || _d === void 0 ? void 0 : _d.name) || gym[j], gym[j], this.options.gym.defeat);
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
        getEfficiency(p) {
            const BREEDING_ATTACK_BONUS = 25;
            return (p.baseAttack * (BREEDING_ATTACK_BONUS / 100) + p.proteinsUsed()) / pokemonMap[p.name].eggCycles;
        }
        pkdxTopEff(topOpt) {
            let listPkm = [];
            for (const pokemon of pokemonList) {
                if (pokemon.nativeRegion <= player.highestRegion()) {
                    let lpkm = App.game.party.getPokemon(pokemon.id);
                    if (lpkm)
                        listPkm.push([lpkm.id, lpkm.name, this.getEfficiency(lpkm)]);
                }
            }
            listPkm.sort(function sortFn(a, b) {
                if (a[2] === b[2]) {
                    return 0;
                }
                else {
                    return a[2] > b[2] ? -1 : 1;
                }
            });
            listPkm = listPkm.slice(0, topOpt || 10);
            this.printArr(listPkm, ShowDebug.log);
            return listPkm;
        }
        bestEvsFarm(topOpt = 10) {
            this.setAreaToFarm();
            let lst = this.pkdxTopEff(topOpt);
            let max = 0;
            let best = "";
            for (let i = 0; i <= player.highestRegion(); i++) {
                let rg = this.capitalize(GameConstants.Region[i]);
                Routes.getRoutesByRegion(i).forEach((rt) => {
                    let nb = 0;
                    let pkmListEv = [];
                    this.concatPkmListFromRoute(rt).forEach((pkm) => {
                        if (lst.find((e) => e[1] === pkm)) {
                            pkmListEv.push(pkm);
                            if (nb >= max) {
                                max = nb;
                                best = `${rg} > ${rt.routeName} => ${max} ${pkmListEv}`;
                                this.areaToFarm.region = i;
                                this.areaToFarm.route = rt.number;
                                this.areaToFarm.subregion = rt.subRegion;
                            }
                        }
                    });
                });
            }
            return best;
        }
        startAutoGym() {
            let autoGym = document.getElementById("auto-gym-start");
            if (autoGym && !autoGym.classList.contains("btn-success")) {
                return true;
            }
            return false;
        }
        stopAutoGym() {
            let autoGym = document.getElementById("auto-gym-start");
            if (autoGym && !autoGym.classList.contains("btn-danger")) {
                autoGym.click();
                return true;
            }
            return false;
        }
        startAutoDungeon() {
            let autoDungeon = document.getElementById("auto-dungeon-start");
            if (autoDungeon && !autoDungeon.classList.contains("btn-success")) {
                autoDungeon.click();
                return true;
            }
            return false;
        }
        stopAutoDungeon() {
            let autoDungeon = document.getElementById("auto-dungeon-start");
            if (autoDungeon && !autoDungeon.classList.contains("btn-danger")) {
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
        check(bothOpt = this.options.both) {
            if (this.options.end === true) {
                this.bestEvsFarm();
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
        moveTo() {
            if (this.areaToFarm.region === 6) {
                player.subregion = this.areaToFarm.subregion;
            }
            if (this.areaToFarm.route !== 0) {
                MapHelper.moveToRoute(this.areaToFarm.route, this.areaToFarm.region);
            }
            else if (this.areaToFarm.town !== "") {
                player.region = this.areaToFarm.region;
                MapHelper.moveToTown(this.areaToFarm.town);
                if (this.areaToFarm.type === Type.gym) {
                    if (player.town().name === this.areaToFarm.town) {
                        for (const gym of player.town().content) {
                            if (gym.town === this.areaToFarm.gym && App.game.gameState !== GameConstants.GameState.gym) {
                                gym.protectedOnclick();
                            }
                        }
                    }
                }
            }
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
                            else if (this.areaToFarm.type === Type.dungeon && this.areaToFarm.town !== "") {
                                curMax = App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(this.areaToFarm.town)]();
                            }
                            else if (this.areaToFarm.type === Type.gym && this.areaToFarm.town !== "") {
                                curMax = App.game.statistics.gymsDefeated[GameConstants.getGymIndex(this.areaToFarm.town)]();
                            }
                            break;
                        case Mode.pokerus:
                            curMax = App.game.party.caughtPokemon.filter((p) => p.pokerus >= GameConstants.Pokerus.Resistant).length;
                            break;
                        case Mode.shiny:
                            curMax = App.game.party.caughtPokemon.filter((p) => p.shiny === true).length;
                            break;
                    }
                    if (this.areaToFarm.until === 0 || curMax >= this.areaToFarm.until) {
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
ad.options.gym.skip = true;
// ad.options.showDebug = AreaDestroyer.ShowDebug.debug
ad.run();
// ad.stop = true
