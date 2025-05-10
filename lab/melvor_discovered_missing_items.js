/**
 * Script to display discovered but missing items in Melvor Idle
 * Use in browser console while the game is open
 */

(function () {
    // Configuration object
    const config = {
        showDropSources: true, // Set to false to hide drop source information
        showItemIds: true, // Set to false to hide item IDs
        showSlayerInfo: true, // Set to false to hide slayer task information
        sortByCombatLevel: true, // Set to false to keep default sort
        topItems: 10, // Set to a number > 0 to limit the number of items shown (0 = show all)
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
            // Check if item has been discovered
            const isDiscovered = game.stats.itemFindCount(item) > 0;
            // Check if it's not in inventory
            const isInInventory = game.bank.hasItem(item);

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
            if (isDiscovered && !isInInventory && !isEquipped) {
                // Get drop sources for this item
                const dropSources = [];

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

                // Sort drop sources by chance (highest to lowest)
                dropSources.sort((a, b) => b.chance - a.chance);

                missingItems.push({
                    item: item,
                    dropSources: dropSources,
                });
            }
        });

        // Sort items if configured
        if (config.sortByCombatLevel) {
            missingItems.sort((a, b) => {
                // Helper function to check if item has slayer drops
                const hasSlayerDrops = (item) => item.dropSources.some(source => source.canSlayer);
                // Helper function to get minimum slayer combat level
                const getMinSlayerCombatLevel = (item) => {
                    const slayerSources = item.dropSources.filter(source => source.canSlayer);
                    return slayerSources.length > 0 ? Math.min(...slayerSources.map(source => source.combatLevel)) : Infinity;
                };
                // Helper function to get minimum non-slayer combat level
                const getMinNonSlayerCombatLevel = (item) => {
                    const nonSlayerSources = item.dropSources.filter(source => !source.canSlayer);
                    return nonSlayerSources.length > 0 ? Math.min(...nonSlayerSources.map(source => source.combatLevel)) : Infinity;
                };

                const aHasSlayer = hasSlayerDrops(a);
                const bHasSlayer = hasSlayerDrops(b);

                // First sort by whether the item has slayer drops
                if (aHasSlayer !== bHasSlayer) {
                    return bHasSlayer - aHasSlayer; // Slayer items first
                }

                // If both have slayer drops, sort by slayer combat level
                if (aHasSlayer && bHasSlayer) {
                    return getMinSlayerCombatLevel(a) - getMinSlayerCombatLevel(b);
                }

                // If neither have slayer drops, sort by non-slayer combat level
                const aHasDrops = a.dropSources.length > 0;
                const bHasDrops = b.dropSources.length > 0;

                if (aHasDrops && bHasDrops) {
                    return getMinNonSlayerCombatLevel(a) - getMinNonSlayerCombatLevel(b);
                }

                // Put items without drops at the end
                return aHasDrops ? -1 : (bHasDrops ? 1 : 0);
            });
        }

        // Print all results in a single console.log
        const itemsToShow = config.topItems > 0 ? missingItems.slice(0, config.topItems) : missingItems;
        console.log(
            `Discovered but missing items (showing ${itemsToShow.length}/${missingItems.length} total):`,
            itemsToShow.length > 0
                ? '\n' +
                      itemsToShow
                          .map(({ item, dropSources }) => {
                              const itemInfo = `- ${item.name}${config.showItemIds ? ` [ID: ${item.id}]` : ''}`;

                              if (!config.showDropSources || dropSources.length === 0) return itemInfo;

                              const dropInfo = dropSources
                                  .map((source) => {
                                      const slayerInfo =
                                          config.showSlayerInfo && source.canSlayer ? ` [${source.taskDifficulty} Task]` : '';
                                      return `\n-- Drops from ${source.monster} (${source.combatLevel})${slayerInfo} (${source.chance.toFixed(2)}%)`;
                                  })
                                  .join('');
                              return `${itemInfo}${dropInfo}`;
                          })
                          .filter(Boolean)
                          .join('\n')
                : 'None found'
        );
    } catch (error) {
        console.error('An error occurred while running the script:', error);
    }
})();
