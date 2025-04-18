// ==UserScript==
// @name          [SteamHunters] Achievements tweaks
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Adds a button to toggle visibility of completed updates (100%) and unlocked achievements on SteamHunters
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[SteamHunters]%20Achievements%20tweaks.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[SteamHunters]%20Achievements%20tweaks.user.js

// @match         https://steamhunters.com/id/*/apps/*/achievements
// @icon          https://www.google.com/s2/favicons?sz=64&domain=steamhunters.com
// @grant         none
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    // Create the button
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'btn btn-default btn-xs';
    toggleButton.innerHTML = '<i class="fa fa-filter"></i> Toggle Visibility';

    // Find the target container
    const spanContainer = document.querySelector('span.pull-right');
    if (spanContainer) {
        spanContainer.appendChild(toggleButton); // Add the button inside the span
    } else {
        console.error('Unable to find <span class="pull-right">');
    }

    // Toggle visibility of completed updates and unlocked achievements
    toggleButton.addEventListener('click', () => {
        // Toggle visibility of completed updates (100%)
        const updates = document.querySelectorAll('li[data-flash^="updates/"]');
        updates.forEach((update) => {
            const contentDiv = update.querySelector('a.media.group.collapse-rotate.rotate-90 > div.media-body.media-middle > div');
            if (contentDiv) {
                const text = contentDiv.textContent || '';
                const isCompleted = text.includes('(100 %)');
                if (isCompleted) {
                    update.style.display = update.style.display === 'none' ? '' : 'none';
                }
            }
        });

        // Toggle visibility of unlocked achievements
        const unlockedItems = document.querySelectorAll('li.unlocked.check-item');
        unlockedItems.forEach((item) => {
            item.style.display = item.style.display === 'none' ? '' : 'none';
        });
    });
})();
