# Pokeclicker

## AreaDestroyer

`dist\AreaDestroyer.js` is working. To compile run: `npm run dev`.

### Usage

```js
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
```

### Does

- Defeat every road, dungeon, gym (until max achievement)
- Catch every shiny available in road & dungeon
- Grind every pokemon from pkrs contagious to pkrs resistant in road & dungeon
- When done, reset quests, then farm best evs (loop every 15 min)

### Require

- [Enhanced Auto Clicker](<https://github.com/Ephenia/Pokeclicker-Scripts#enhanced-auto-clicker-enhancedautoclickeruserjs-one-click-install>) with AutoClick [ON]
- [[Custom] Simple Weather Changer](<https://github.com/Ephenia/Pokeclicker-Scripts#custom-simple-weather-changer-simpleweatherchangeruserjs-one-click-install>)

### More info

For more info on pokeclicker source code: <https://github.com/pokeclicker/pokeclicker>
