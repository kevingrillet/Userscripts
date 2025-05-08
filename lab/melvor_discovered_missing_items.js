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
                missingItems.push(item);
            }
        });

        // Print all results in a single console.log
        console.log(
            'Discovered but missing items:',
            missingItems.length > 0 ? '\n' + missingItems.map((item) => `- ${item.name} [ID: ${item.id}]`).join('\n') : 'None found'
        );
    } catch (error) {
        console.error('An error occurred while running the script:', error);
    }
})();
