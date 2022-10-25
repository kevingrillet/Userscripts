/**
 * @name:         AreaDestroyer
 * @author:       kevingrillet
 * @description:  Clear areas (roads/dungeons/gym) by doing Achievements, Catch Shiny, farm Evs (need PRKS ofc). Story need to be complete for every regions you want to farm.
 * @license:      GPL-3.0 License
 * @version:      0.1
 *
 * @required:     https://github.com/Ephenia/Pokeclicker-Scripts (Enhanced Auto Clicker) with AutoClick [ON]
 *
 * @tutorial:     var ad = new AreaDestroyer(); ad.opt.gym.skip = true; ad.run() //ad.stop = true
 *
 * @todo:         Fix Gym (some town doesn't work); JS -> TS + ESLint
 */

// TODO
// Replace .unique() with           let merge = [...new Set([...a, ...b])];
// Replace this.lprint(csv) with    console.table(arr)

Array.prototype.unique = function () {
  let a = this.concat();
  for (let i = 0; i < a.length; ++i) {
    for (let j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j])
        a.splice(j--, 1);
    }
  }
  return a;
}

// eslint-disable-next-line no-unused-vars
class AreaDestroyer {
  constructor() {
    this.enums = {
      mode: {
        defeat: 0,
        shiny: 1,
        pokerus: 2
      },
      showDebug: {
        debug: 0,
        log: 1,
        warn: 2,
        err: 3
      },
      type: {
        none: 0,
        road: 1,
        dungeon: 2,
        gym: 3
      }
    };

    this.stop = false;

    this.opt = {
      both: false,
      dungeon: {
        all: true,
        defeat: 10,
        skip: false,
      },
      end: false,
      gym: {
        all: true,
        defeat: 10,
        skip: false,
      },
      mode: this.enums.mode.defeat,
      road: {
        all: true,
        defeat: 100,
        skip: false,
        spec: false,
      },
      showDebug: this.enums.showDebug.log,
      timeout: 60,
    }

    this.AreaToFarm = {
      region: 0,
      route: 0,
      subregion: 0,
      type: 0,
      town: 0,
      gym: 0,
      until: 0
    };
    this.elPlayer = document.getElementById('AreaDestroyerAudio') || document.createElement('audio');
    this.elPlayer.setAttribute('id', 'AreaDestroyerAudio');
    this.elPlayer.src = 'https://raw.githubusercontent.com/kevingrillet/Userscripts/main/assets/my-work-is-done.mp3';
  }

  // Internal crap
  lPrint(msg, type) {
    if ((!msg) || ((type || 0) < this.opt.showDebug))
      return;
    let date = new Date().toLocaleString();
    if ((type || 0) === 0) {
      console.debug(date);
      console.debug(msg);
    } else {
      if ((type || 0) === 1) {
        console.log(`${date} - ${msg}`);
      } else if ((type || 0) === 2) {
        console.warn(`${date} - ${msg}`);
      }
    }
  }

  capitalize(msg) {
    return msg.charAt(0).toUpperCase() + msg.slice(1);
  }

  concatPkmListFromRoute(route, specOpt) {
    let pkmList = [];
    pkmList = pkmList.concat(route.pokemon.headbutt);
    pkmList = pkmList.concat(route.pokemon.land);
    if ((specOpt || this.opt.road.spec) === true)
      route.pokemon.special.forEach((e) => pkmList = pkmList.concat(e.pokemon));
    pkmList = pkmList.concat(route.pokemon.water);
    return pkmList.unique();
  }

  setAreaToFarm(type, region, subregion, route, town, gym, until) {
    this.AreaToFarm = {
      type: type || 0,
      region: region || 0,
      route: route || 0,
      subregion: subregion || 0,
      town: town || 0,
      gym: gym || 0,
      until: until || 0
    };
  }

  updateMode() {
    switch (this.opt.mode) {
      case this.enums.mode.defeat:
        if (this.opt.road.skip === false && this.opt.road.defeat < 10000){
          this.opt.road.defeat *= 10;
        } else if (this.opt.dungeon.skip === false && this.opt.dungeon.defeat < 500){
          switch (this.opt.dungeon.defeat) {
            case 10:
              this.opt.dungeon.defeat = 100;
              break;
            case 100:
              this.opt.dungeon.defeat = 250;
              break;
            case 250:
              this.opt.dungeon.defeat = 500;
              break;
          }
        } else if (this.opt.gym.skip === false && this.opt.gym.defeat < 1000){
          this.opt.gym.defeat *= 10;
        } else {
          this.opt.mode = this.enums.mode.shiny;
        }
        break;
      case this.enums.mode.shiny:
        this.opt.mode = this.enums.mode.pokerus;
        break;
      case this.enums.mode.pokerus:
      default:
        this.opt.end = true;
        break;
    }
    this.lPrint(`AreaDestroyer updateMode > mode:${this.opt.mode}; road.defeat:${this.opt.road.defeat}; dungeon.defeat:${this.opt.dungeon.defeat}; end:${this.opt.end}`, 1)
  }

  // Complete achievements!
  calcRoad(allOpt, specOpt) {
    let max = 0;
    let best = "";
    let pkmListTotal = [];
    let output = `Region; Road; Id; Pokemon; Shiny; EVs \n`;
    if ((allOpt || this.opt.road.all) === true) {
      for (let i = 0; i <= player.highestRegion(); i++) {
        let rg = this.capitalize(GameConstants.Region[i]);
        Routes.getRoutesByRegion(i).some((rt) => {
          if (this.opt.mode === this.enums.mode.defeat) {
            if (App.game.statistics.routeKills[i][rt.number]() < this.opt.road.defeat) {
              this.setAreaToFarm(this.enums.type.road, i, rt.subRegion, rt.number, 0, 0, this.opt.road.defeat)
              output += `${rg}; ${rt.routeName}; ; ; ;\n`;
              best = `${rg} > ${rt.routeName}`;
              return true
            }
          } else {
            let nb = 0;
            this.concatPkmListFromRoute(rt, specOpt).forEach((pkm) => {
              let hpkm = PokemonHelper.getPokemonByName(pkm);
              let ppkm = App.game.party.getPokemon(hpkm.id);
              if (ppkm && ((this.opt.mode === this.enums.mode.shiny && ppkm?.shiny === false) || (this.opt.mode === this.enums.mode.pokerus && ppkm?.pokerus === 2))) {
                pkmListTotal.push(pkm);
                output += `${rg}; ${rt.routeName}; ${hpkm.id}; ${pkm}; ${pkm.shiny}; ${ppkm.evs()}\n`;
                if (++nb > max) {
                  max = nb;
                  best = `${rg} > ${rt.routeName} => ${max}`;
                  this.setAreaToFarm(this.enums.type.road, i, rt.subRegion, rt.number)
                }
              }
            });
          }
        });
      }
    } else {
      let rg = this.capitalize(GameConstants.Region[player.region]);
      Routes.getRoutesByRegion(player.region).forEach((rt) => {
        if (this.opt.mode === this.enums.mode.defeat) {
          if (App.game.statistics.routeKills[player.region][rt.number]() < this.opt.road.defeat) {
            this.setAreaToFarm(this.enums.type.road, player.region, rt.subRegion, rt.number, 0, 0, this.opt.road.defeat)
            output += `${rg}; ${rt.routeName}; ; ; ;\n`;
            best = `${rg} > ${rt.routeName}`;
            return true;
          }
        } else {
          let nb = 0;
          this.concatPkmListFromRoute(rt, specOpt).forEach((pkm) => {
            let hpkm = PokemonHelper.getPokemonByName(pkm);
            let ppkm = App.game.party.getPokemon(hpkm.id);
            if (ppkm && ((this.opt.mode === this.enums.mode.shiny && ppkm?.shiny === false) || (this.opt.mode === this.enums.mode.pokerus && ppkm?.pokerus === 2))) {
              pkmListTotal.push(pkm);
              output += `${rg}; ${rt.routeName}; ${hpkm.id}; ${pkm}; ${pkm.shiny}; ${ppkm.evs()}\n`;
              if (++nb > max) {
                max = nb;
                best = `${rg} > ${rt.routeName} => ${max}`;
                  this.setAreaToFarm(this.enums.type.road, player.region, rt.subRegion, rt.number)
              }
            }
          });
        }
      });
    }
    if (pkmListTotal.length === 0 && this.AreaToFarm.until === 0)
      return false;
    let curMax = 10000;
    switch (this.opt.mode) {
      case this.enums.mode.pokerus:
        this.AreaToFarm.until = App.game.party.caughtPokemon.filter((p) => p.pokerus >= GameConstants.Pokerus.Resistant).length + max;
        curMax = App.game.party.caughtPokemon.filter((p) => p.pokerus >= GameConstants.Pokerus.Resistant).length + pkmListTotal.unique().length;
        break;
      case this.enums.mode.shiny:
        this.AreaToFarm.until = App.game.party.caughtPokemon.filter((p) => p.shiny === true).length + max;
        curMax = App.game.party.caughtPokemon.filter((p) => p.shiny === true).length + pkmListTotal.unique().length;
        break;
      default:
        this.AreaToFarm.until = this.opt.road.defeat;
        break;
    }
    this.lPrint(output);
    this.lPrint(pkmListTotal.unique());
    this.lPrint(`${best} (${this.AreaToFarm.until}[${curMax}])`, 1);
    return true;
  }

  calcDungeon(allOpt) {
    let max = 0;
    let best = "";
    let pkmListTotal = [];
    let output = `Region; Road; Id; Pokemon; Shiny; EVs \n`;
    if ((allOpt || this.opt.dungeon.all) === true) {
      for (let i = 0; i <= player.highestRegion(); i++) {
        let rg = this.capitalize(GameConstants.Region[i]);
        let dgs = GameConstants.RegionDungeons[i];
        for (let j = 0; j < dgs.length; j++) {
          if (this.opt.mode === this.enums.mode.defeat) {
            if (App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(dgs[j])]() < this.opt.dungeon.defeat) {
              this.setAreaToFarm(this.enums.type.dungeon, i, 0, 0, dgs[j], 0, this.opt.dungeon.defeat);
              best = `${rg} > ${dgs[j]}`;
              break;
            }
          } else {
            let nb = 0;
            dungeonList[dgs[j]]?.pokemonList.forEach((pkm) => {
              let hpkm = PokemonHelper.getPokemonByName(pkm);
              let ppkm = App.game.party.getPokemon(hpkm.id);
              if (ppkm && ((this.opt.mode === this.enums.mode.shiny && ppkm?.shiny === false) || (this.opt.mode === this.enums.mode.pokerus && ppkm?.pokerus === 2))) {
                pkmListTotal.push(pkm);
                output += `${rg}; ${dgs[j]}; ${hpkm.id}; ${pkm}; ${pkm.shiny}; ${ppkm.evs()}\n`;
                if (++nb > max) {
                  max = nb;
                  best = `${rg} > ${dgs[j]} => ${max}`;
                  this.setAreaToFarm(this.enums.type.dungeon, i, 0, 0, dgs[j]);
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
        if (this.opt.mode === this.enums.mode.defeat) {
          if (App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(dgs[j])]() < this.opt.dungeon.defeat) {
            this.setAreaToFarm(this.enums.type.dungeon, player.region, 0, 0, dgs[j], 0, this.opt.dungeon.defeat)
            best = `${rg} > ${dgs[j]}`;
            break;
          }
        } else {
          let nb = 0;
          dungeonList[dgs[j]]?.pokemonList.forEach((pkm) => {
            let hpkm = PokemonHelper.getPokemonByName(pkm);
            let ppkm = App.game.party.getPokemon(hpkm.id);
            if (ppkm && ((this.opt.mode === this.enums.mode.shiny && ppkm?.shiny === false) || (this.opt.mode === this.enums.mode.pokerus && ppkm?.pokerus === 2))) {
              pkmListTotal.push(pkm);
              output += `${rg}; ${dgs[j]}; ${hpkm.id}; ${pkm}; ${pkm.shiny}; ${ppkm.evs()}\n`;
              if (++nb > max) {
                max = nb;
                best = `${rg} > ${dgs[j]} => ${max}`;
                this.setAreaToFarm(this.enums.type.dungeon, player.region, 0, 0, dgs[j])
              }
            }
          });
        }
      }
    }
    if (pkmListTotal.length === 0 && this.AreaToFarm.until === 0)
      return false;
    let curMax = 500;
    switch (this.opt.mode) {
      case this.enums.mode.pokerus:
        this.AreaToFarm.until = App.game.party.caughtPokemon.filter((p) => p.pokerus >= GameConstants.Pokerus.Resistant).length + max;
        curMax = App.game.party.caughtPokemon.filter((p) => p.pokerus >= GameConstants.Pokerus.Resistant).length + pkmListTotal.unique().length;
        break;
      case this.enums.mode.shiny:
        this.AreaToFarm.until = App.game.party.caughtPokemon.filter((p) => p.shiny === true).length + max;
        curMax = App.game.party.caughtPokemon.filter((p) => p.shiny === true).length + pkmListTotal.unique().length;
        break;
      default:
        this.AreaToFarm.until = this.opt.dungeon.defeat;
        break;
    }
    this.lPrint(output);
    this.lPrint(pkmListTotal.unique());
    this.lPrint(`${best} (${this.AreaToFarm.until}[${curMax}])`, 1);
    return true;
  }

  calcGym(allOpt) {
    let best = "";
    if ((allOpt || this.opt.gym.all) === true) {
      for (let i = 0; i <= player.highestRegion(); i++) {
        let rg = this.capitalize(GameConstants.Region[i]);
        let gym = GameConstants.RegionGyms[i];
        for (let j = 0; j < gym.length; j++) {
          if (App.game.statistics.gymsDefeated[GameConstants.getGymIndex(gym[j])]() < this.opt.gym.defeat) {
            this.setAreaToFarm(this.enums.type.gym, i, 0, 0, GymList[gym[j]]?.parent?.name || gym[j], gym[j], this.opt.gym.defeat);
            best = `${rg} > ${gym[j]}`;
            break;
          }
        }
      }
    } else {
      let rg = this.capitalize(GameConstants.Region[player.region]);
      let gym = GameConstants.RegionGyms[player.region];
      for (let j = 0; j < gym.length; j++) {
        if (App.game.statistics.gymsDefeated[GameConstants.getGymIndex(gym[j])]() < this.opt.gym.defeat) {
          this.setAreaToFarm(this.enums.type.gym, player.region, 0, 0, GymList[gym[j]]?.parent?.name || gym[j], gym[j], this.opt.gym.defeat)
          best = `${rg} > ${gym[j]}`;
          break;
        }
      }
    }
    if (this.AreaToFarm.until === 0)
      return false;
    let curMax = 1000;
    this.lPrint(`${best} (${this.AreaToFarm.until}[${curMax}])`, 1);
    return true;
  }

  // Farm best effeciency late
  getEfficiency(p) {
    const BREEDING_ATTACK_BONUS = 25;
    return ((p.baseAttack * (BREEDING_ATTACK_BONUS / 100) + p.proteinsUsed()) / pokemonMap[p.name].eggCycles);
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
      } else {
        return (a[2] > b[2]) ? -1 : 1;
      }
    });
    listPkm = listPkm.slice(0, (topOpt || 10));
    return listPkm;
  }

  bestEvsFarm(topOpt) {
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
              this.AreaToFarm.region = i;
              this.AreaToFarm.route = rt.number;
              this.AreaToFarm.subregion = rt.subRegion;
            }
          }
        });
      });
    }
    return best;
  }

  // Loop auto, everything usable

  startAutoGym() {
    let autoGym = document.getElementById("auto-gym-start");
    if (autoGym && !autoGym.classList.contains("btn-success")) {
      return true;
    }
    return false;
  }

  stopAutoGym() {
    let autoGym = document.getElementById("auto-gym-start");
    if(autoGym && !autoGym.classList.contains("btn-danger")) {
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
    if(autoDungeon && !autoDungeon.classList.contains("btn-danger")) {
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

  check(bothOpt) {
    if (this.opt.end === true ) {
      this.bestEvsFarm();
      this.moveTo();
      return -1
    }
    if (this.opt.road.skip === false)
      if ((this.calcRoad() === true) && !((bothOpt || this.opt.both) === true))
        return this.enums.type.road;
    if (this.opt.dungeon.skip === false)
      if (this.calcDungeon() === true)
        return this.enums.type.dungeon;
    if ((this.opt.mode === this.enums.mode.defeat) && (this.opt.gym.skip === false))
      if (this.calcGym() === true)
        return this.enums.type.gym;
    return this.enums.type.none;
  }

  moveTo() {
    if (this.AreaToFarm.region === 6)
      player.subregion = this.AreaToFarm.subregion;
    if (this.AreaToFarm.route !== 0) {
      MapHelper.moveToRoute(this.AreaToFarm.route, this.AreaToFarm.region)
    } else if (this.AreaToFarm.town !== 0) {
      player.region = this.AreaToFarm.region;
      MapHelper.moveToTown(this.AreaToFarm.town);
      if (this.AreaToFarm.type === this.enums.type.gym){
        if(player.town().name === this.AreaToFarm.town) {
          for(const gym of player.town().content) {
            if(gym.town === this.AreaToFarm.gym && App.game.gameState !== GameConstants.GameState.gym) {
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
        this.lPrint(`AreaDestroyer stopped`, 1);
      } else {
        let curMax = 0;
        switch (this.opt.mode) {
          case this.enums.mode.defeat:
            if (this.AreaToFarm.type === this.enums.type.road && this.AreaToFarm.route !== 0)
              curMax = App.game.statistics.routeKills[this.AreaToFarm.region][this.AreaToFarm.route]()
            else if (this.AreaToFarm.type === this.enums.type.dungeon &&this.AreaToFarm.town !== 0)
              curMax = App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(this.AreaToFarm.town)]();
            else if (this.AreaToFarm.type === this.enums.type.gym &&this.AreaToFarm.town !== 0)
              curMax = App.game.statistics.gymsDefeated[GameConstants.getGymIndex(this.AreaToFarm.town)]();
            break;
          case this.enums.mode.pokerus:
            curMax = App.game.party.caughtPokemon.filter((p) => p.pokerus >= GameConstants.Pokerus.Resistant).length;
            break;
          case this.enums.mode.shiny:
            curMax = App.game.party.caughtPokemon.filter((p) => p.shiny === true).length;
            break;
        }
        if ((this.AreaToFarm.until === 0) || (curMax >= this.AreaToFarm.until)) {
          if (this.AreaToFarm.type === this.enums.type.dungeon) {
            this.stopAutoDungeon();
            this.moveTo()
          }
          if (this.AreaToFarm.type === this.enums.type.gym) {
            this.stopAutoGym();
            this.moveTo()
          }
          this.setAreaToFarm();
          let chkRes = this.check();
          if (chkRes === this.enums.type.road) {
            this.moveTo();
            this.lPrint(`AreaDestroyer NextArea`, 1);
            this.auto();
          } else if (chkRes === this.enums.type.dungeon) {
            this.moveTo();
            if (this.startAutoDungeon() === true) {
              this.lPrint(`AreaDestroyer NextArea`, 1);
              this.auto();
            } else {
              this.lPrint(`AreaDestroyer Failed to auto dungeon`, 2);
            }
          } else if (chkRes === this.enums.type.gym) {
            this.moveTo();
            if (this.startAutoGym() === true) {
              this.lPrint(`AreaDestroyer NextArea`, 1);
              this.auto();
            } else {
              this.lPrint(`AreaDestroyer Failed to auto dungeon`, 2);
            }
          } else {
            this.lPrint(`AreaDestroyer DONE`, 1);
            this.elPlayer.play();
            this.updateMode();
            this.run();
          }
        } else {
          this.lPrint(`AreaDestroyer IDLE ${curMax}/${this.AreaToFarm.until}`);
          this.auto();
        }
      }
    }, this.opt.timeout * 1000);
  }

  run(bothOpt) {
    this.setAreaToFarm();
    var res = this.check(bothOpt);
    while (res === this.enums.type.none) {
      this.updateMode()
      res = this.check(bothOpt);
    }
    if (res !== this.enums.type.none)
      this.moveTo();
    if (res === this.enums.type.dungeon)
      this.startAutoDungeon();
    if (res === this.enums.type.gym)
      this.startAutoGym();
    if (res > this.enums.type.none)
      this.auto();
  }
}

var ad = new AreaDestroyer();
// ad.opt.dungeon.skip = true;
ad.opt.gym.skip = true;
// ad.opt.showDebug = ad.enums.showDebug.debug
ad.run()
// ad.stop = true