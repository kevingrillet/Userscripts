# Melvor Idle - Discovered Missing Items

## Description

Console script to display all discovered but missing items in **Melvor Idle**. This script allows you to quickly identify which items you have already found at least once but are neither in your inventory nor equipped.

## Usage

1. Open **Melvor Idle** in your browser
2. Open the developer console (F12 → Console)
3. Copy/paste the content of the `melvor_discovered_missing_items.js` file
4. Press Enter

## Features

### Item Detection

- ✅ Identifies discovered items missing from inventory
- ✅ Checks that the item is not equipped in any equipment preset
- ✅ Displays drop sources (monsters)
- ✅ Displays dungeon sources (chests and rewards)

### Information Provided

For each missing item, the script displays:

- **Item name** (with optional ID)
- **Monsters** that can drop the item:
  - Monster combat level
  - Drop chance percentage
  - Indication if it's a Slayer task (with difficulty)
- **Dungeons** where the item can be found:
  - Recommended dungeon level
  - Reward type (Chest or Completion)
  - Chance percentage

### Smart Sorting

Items are automatically sorted by:

1. **Slayer tasks first** (by ascending level)
2. **Monster drops** (by ascending level)
3. **Dungeons** (by ascending level)

## Configuration

The script can be customized via the `CONFIG` object at the beginning of the file:

```javascript
const CONFIG = {
    filterDiscovered: true,      // false = show all items
    gameMode: [],                // Filter by mode: 'base', 'td', 'aod', 'cr'
    showDropSources: true,       // Show drop sources
    showDungeonInfo: true,       // Show dungeon info
    showItemIds: true,           // Show item IDs
    showSlayerInfo: true,        // Show Slayer info
    sortByCombatLevel: true,     // Sort by combat level
    topItems: 0,                 // Limit number of items (0 = all)
};
```

### Detailed Options

| Option | Type | Description |
|--------|------|-------------|
| `filterDiscovered` | `boolean` | If `false`, shows all items even undiscovered ones |
| `gameMode` | `array` | Filter by game mode: `['base']`, `['td']`, `['aod']`, `['cr']` or combination |
| `showDropSources` | `boolean` | Show monsters that drop the item |
| `showDungeonInfo` | `boolean` | Show dungeons containing the item |
| `showItemIds` | `boolean` | Show item technical ID |
| `showSlayerInfo` | `boolean` | Show Slayer task difficulties |
| `sortByCombatLevel` | `boolean` | Sort results by combat level |
| `topItems` | `number` | Limit to N items (0 = unlimited) |

### Game Mode Codes

- `'base'`: Base game (melvorBase)
- `'td'`: Throne of the Herald (melvorTotH)
- `'aod'`: Atlas of Discovery (melvorAoD)
- `'cr'`: Crown of Refuge (melvorCR)

## Usage Examples

### Show only base game items

```javascript
gameMode: ['base']
```

### Show only the first 10 items

```javascript
topItems: 10
```

### Simple mode (no details)

```javascript
showDropSources: false,
showDungeonInfo: false,
showItemIds: false,
showSlayerInfo: false
```

## Slayer Task Difficulties

The script automatically identifies difficulty based on combat level:

| Difficulty | Combat Level |
|-----------|-------------|
| Easy | ≤ 49 |
| Normal | 50-99 |
| Hard | 100-199 |
| Elite | 200-374 |
| Master | 375-789 |
| Legendary | 790-999 |
| Mythical | ≥ 1000 |

## Example Output

```txt
Discovered but missing items (showing 3/3 total):
- Dragon Javelin [ID: melvorF:Dragon_Javelin]
-- Drops from Adult Dragon (265) [Elite Task] (1.50%)
-- Found in Dragon Valley (Level 265) (Chest) (5.00%)

- Ancient Sword [ID: melvorTotH:Ancient_Sword]
-- Found in Into the Mist (Level 380) (Completion) (100.00%)

- Slayer Helmet [ID: melvorF:Slayer_Helmet_Basic]
-- Drops from Slayer Task Monster (varies) [Any Task] (0.10%)
```

## Notes

- The script does not affect your game save, it is read-only
- Run it whenever you want an update
- Compatible with all game expansions (TotH, AoD, CR)

## License

GPL-3.0 License
