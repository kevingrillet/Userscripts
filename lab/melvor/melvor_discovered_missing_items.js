/**
 * Script to display discovered but missing items in Melvor Idle
 * Use in browser console while the game is open
 */

console.clear(); // Clear console for better readability

(function () {
    // Configuration object
    const CONFIG = {
        filterDiscovered: true, // Set to false to show all items regardless of discovery status
        gameMode: [], // Possible values: 'base', 'td', 'aod', 'cr' (for base game, Throne of the Herald, Astrology of Dragons, Crimson Reborn)
        showDropSources: true, // Set to false to hide drop source information
        showDungeonInfo: true, // Set to false to hide dungeon information
        showItemIds: true, // Set to false to hide item IDs
        showSlayerInfo: true, // Set to false to hide slayer task information
        sortByCombatLevel: true, // Set to false to keep default sort
        topItems: 0, // Set to a number > 0 to limit the number of items shown (0 = show all)
    };

    // Check if game is loaded
    if (typeof game === 'undefined') {
        console.error("Error: Melvor Idle game is not accessible. Make sure you're on the game page.");
        return;
    }

    try {
        let missingItems = [];

        // Loop through all game items
        game.items.allObjects.forEach((item) => {
            // Check item game mode
            if (CONFIG.gameMode && CONFIG.gameMode.length > 0) {
                const itemGameMode = item.gamemode;
                const isValidGameMode = CONFIG.gameMode.some(
                    (mode) =>
                        (mode === 'base' && itemGameMode === 'melvorBase') ||
                        (mode === 'td' && itemGameMode === 'melvorTotH') ||
                        (mode === 'aod' && itemGameMode === 'melvorAoD') ||
                        (mode === 'cr' && itemGameMode === 'melvorCR')
                );
                if (!isValidGameMode) {
                    return; // Skip items not from selected game modes
                }
            }

            // Check if item has been discovered
            const isDiscovered = game.stats.itemFindCount(item) > 0;
            // Check if it's not in inventory
            const isInInventory = game.bank.hasItem(item);

            // Only process if we want to show all items or if the item is discovered
            if (!CONFIG.filterDiscovered || isDiscovered) {
                // Check if it's not equipped in any preset
                let isEquipped = false;

                // Check all equipment presets
                if (game.combat && game.combat.player && game.combat.player.equipmentSets) {
                    // Loop through all equipment sets
                    for (const equipmentSet of game.combat.player.equipmentSets) {
                        if (!equipmentSet || !equipmentSet.equipment || !equipmentSet.equipment.equippedArray) continue;

                        // Loop through all equipped slots in this set
                        for (const equipped of equipmentSet.equipment.equippedArray) {
                            if (equipped && equipped.item && equipped.item === item) {
                                isEquipped = true;
                                break;
                            }
                        }

                        if (isEquipped) break;
                    }
                }

                // Add the complete item object to missing items list if discovered but not in inventory or equipped
                if ((!CONFIG.filterDiscovered || isDiscovered) && !isInInventory && !isEquipped) {
                    // Get drop sources for this item
                    const dropSources = [];
                    const dungeonSources = []; // Array for dungeon sources

                    game.monsters.allObjects.forEach((monster) => {
                        const drops = monster.lootTable.drops;
                        drops.forEach((drop) => {
                            if (drop.item === item) {
                                // Get slayer task difficulty based on combat level
                                let taskDifficulty = '';

                                if (monster.canSlayer) {
                                    if (monster.combatLevel <= 49) taskDifficulty = 'Easy';
                                    else if (monster.combatLevel <= 99) taskDifficulty = 'Normal';
                                    else if (monster.combatLevel <= 199) taskDifficulty = 'Hard';
                                    else if (monster.combatLevel <= 374) taskDifficulty = 'Elite';
                                    else if (monster.combatLevel <= 789) taskDifficulty = 'Master';
                                    else if (monster.combatLevel <= 999) taskDifficulty = 'Legendary';
                                    else taskDifficulty = 'Mythical';
                                }

                                dropSources.push({
                                    canSlayer: monster.canSlayer,
                                    chance: (drop.weight / monster.lootTable.totalWeight) * 100,
                                    combatLevel: monster.combatLevel,
                                    monster: monster.name,
                                    taskDifficulty: monster.canSlayer ? taskDifficulty : '',
                                });
                            }
                        });
                    });

                    // Function to get dungeon combat level
                    const getDungeonLevel = (dungeon) => {
                        // Use the highest level monster in the dungeon as reference
                        return dungeon.monsters
                            ? Math.max(...dungeon.monsters.map((monster) => monster.combatLevel))
                            : dungeon.combinedModifiers?.decreasedMinimumCombatLevel || dungeon.recommendedBaseCombatLevel || 0;
                    };

                    // Modify dungeon sources collection to include max monster level
                    game.dungeons.allObjects.forEach((dungeon) => {
                        if (dungeon._rewards) {
                            const dungeonLevel = getDungeonLevel(dungeon);
                            dungeon._rewards.forEach((reward) => {
                                if (reward.type === 'Item' && reward.name === item.name) {
                                    dungeonSources.push({
                                        dungeon: dungeon.name,
                                        chance: 100,
                                        type: 'completion',
                                        level: dungeonLevel,
                                    });
                                } else if (reward.type === 'Chest' && reward.dropTable && reward.dropTable.drops) {
                                    reward.dropTable.drops.forEach((drop) => {
                                        if (drop.item === item) {
                                            dungeonSources.push({
                                                dungeon: dungeon.name,
                                                chance: (drop.weight / reward.dropTable.totalWeight) * 100,
                                                type: 'chest',
                                                level: dungeonLevel,
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });

                    // Sort drop sources by chance (highest to lowest)
                    dropSources.sort((a, b) => b.chance - a.chance);

                    missingItems.push({
                        item: item,
                        dropSources: dropSources,
                        dungeonSources: dungeonSources, // Add dungeon sources
                    });
                }
            }
        });

        // Sort items if configured
        if (CONFIG.sortByCombatLevel) {
            missingItems.sort((a, b) => {
                // Helper function to check if item has slayer drops
                const hasSlayerDrops = (item) => item.dropSources.some((source) => source.canSlayer);
                // Helper function to get minimum slayer combat level
                const getMinSlayerCombatLevel = (item) => {
                    const slayerSources = item.dropSources.filter((source) => source.canSlayer);
                    return slayerSources.length > 0 ? Math.min(...slayerSources.map((source) => source.combatLevel)) : Infinity;
                };
                // Helper function to get minimum non-slayer combat level
                const getMinNonSlayerCombatLevel = (item) => {
                    const nonSlayerSources = item.dropSources.filter((source) => !source.canSlayer);
                    return nonSlayerSources.length > 0 ? Math.min(...nonSlayerSources.map((source) => source.combatLevel)) : Infinity;
                };

                const aHasSlayer = hasSlayerDrops(a);
                const bHasSlayer = hasSlayerDrops(b);
                const aHasDrops = a.dropSources.length > 0;
                const bHasDrops = b.dropSources.length > 0;
                const aHasDungeon = a.dungeonSources.length > 0;
                const bHasDungeon = b.dungeonSources.length > 0;

                // Slayer first
                if (aHasSlayer !== bHasSlayer) {
                    return bHasSlayer - aHasSlayer;
                }

                // If both have slayer drops, sort by slayer combat level
                if (aHasSlayer && bHasSlayer) {
                    return getMinSlayerCombatLevel(a) - getMinSlayerCombatLevel(b);
                }

                if (aHasDrops !== bHasDrops) {
                    return bHasDrops - aHasDrops;
                }

                if (aHasDrops && bHasDrops) {
                    return getMinNonSlayerCombatLevel(a) - getMinNonSlayerCombatLevel(b);
                }

                // Add check for dungeon sources
                if (aHasDungeon !== bHasDungeon) {
                    return bHasDungeon - aHasDungeon;
                }

                // Then dungeons
                if (aHasDungeon && bHasDungeon) {
                    // First sort by dungeon level
                    const aMinLevel = Math.min(...a.dungeonSources.map((source) => source.level));
                    const bMinLevel = Math.min(...b.dungeonSources.map((source) => source.level));
                    if (aMinLevel !== bMinLevel) {
                        return aMinLevel - bMinLevel;
                    }
                    // If same level, sort by name
                    return a.dungeonSources[0].dungeon.localeCompare(b.dungeonSources[0].dungeon);
                }

                return 0;
            });
        }

        // Print all results in a single console.log
        const itemsToShow = CONFIG.topItems > 0 ? missingItems.slice(0, CONFIG.topItems) : missingItems;
        console.log(
            `Discovered but missing items (showing ${itemsToShow.length}/${missingItems.length} total):`,
            itemsToShow.length > 0
                ? '\n' +
                      itemsToShow
                          .map(({ item, dropSources, dungeonSources }) => {
                              const itemInfo = `- ${item.name}${CONFIG.showItemIds ? ` [ID: ${item.id}]` : ''}`;

                              if (!CONFIG.showDropSources || (dropSources.length === 0 && dungeonSources.length === 0)) return itemInfo;

                              const dropInfo = dropSources
                                  .map((source) => {
                                      const slayerInfo = CONFIG.showSlayerInfo && source.canSlayer ? ` [${source.taskDifficulty} Task]` : '';
                                      return `\n-- Drops from ${source.monster} (${source.combatLevel})${slayerInfo} (${source.chance.toFixed(2)}%)`;
                                  })
                                  .join('');

                              const dungeonInfo =
                                  CONFIG.showDungeonInfo && dungeonSources.length > 0
                                      ? dungeonSources
                                            .map((source) => {
                                                const levelInfo = source.level > 0 ? ` (Level ${source.level})` : '';
                                                const sourceType = source.type === 'chest' ? 'Chest' : 'Completion';
                                                return `\n-- Found in ${source.dungeon}${levelInfo} (${sourceType}) (${source.chance.toFixed(2)}%)`;
                                            })
                                            .join('')
                                      : '';

                              return `${itemInfo}${dropInfo}${dungeonInfo}`;
                          })
                          .filter(Boolean)
                          .join('\n')
                : 'None found'
        );
    } catch (error) {
        console.error('An error occurred while running the script:', error);
    }
})();
