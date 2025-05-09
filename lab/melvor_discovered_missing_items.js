/**
 * Script to display discovered but missing items in Melvor Idle
 * Use in browser console while the game is open
 */

(function () {
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

                                slayerInfo = ` [${taskDifficulty} Task]`;
                            }

                            dropSources.push({
                                monster: monster.name,
                                chance: (drop.weight / monster.lootTable.totalWeight) * 100,
                                canSlayer: monster.canSlayer,
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

        // Print all results in a single console.log
        console.log(
            'Discovered but missing items:',
            missingItems.length > 0
                ? '\n' +
                      missingItems
                          .map(({ item, dropSources }) => {
                              if (dropSources.length === 0) return null;
                              const dropInfo =
                                  dropSources
                                      .map((source) => {
                                          const slayerInfo = source.canSlayer ? ` [${source.taskDifficulty} Task]` : '';
                                          return `\n-- Drops from ${source.monster}${slayerInfo} (${source.chance.toFixed(2)}%)`;
                                      })
                                      .join('');
                              return `- ${item.name} [ID: ${item.id}]${dropInfo}`;
                          })
                          .filter(Boolean)
                          .join('\n')
                : 'None found'
        );
    } catch (error) {
        console.error('An error occurred while running the script:', error);
    }
})();
