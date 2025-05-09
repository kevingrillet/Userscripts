// ==UserScript==
// @name          [SteamHunters] Achievements tweaks
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Adds a button to toggle visibility of completed updates (100%) and unlocked achievements on SteamHunters
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           steamhunters.com
// @version       1.0.2

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

    let isFiltered = false;

    function toggleVisibility() {
        isFiltered = !isFiltered;
        const button = document.getElementById('toggle-visibility-btn');
        const icon = button.querySelector('i');

        // Update button appearance
        icon.className = isFiltered ? 'fa fa-eye-slash' : 'fa fa-filter';
        button.querySelector('span').textContent = isFiltered ? ' Show Completed' : ' Hide Completed';

        // Toggle visibility of completed updates (100%)
        const updates = document.querySelectorAll('li[data-flash^="updates/"]');
        updates.forEach((update) => {
            const contentDiv = update.querySelector('a.media.group.collapse-rotate.rotate-90 > div.media-body.media-middle > div');
            if (contentDiv) {
                const text = contentDiv.textContent || '';
                const isCompleted = text.includes('(100 %)');
                if (isCompleted) {
                    update.style.display = isFiltered ? 'none' : '';
                }
            }
        });

        // Toggle visibility of unlocked achievements
        const unlockedItems = document.querySelectorAll('li.unlocked.check-item');
        unlockedItems.forEach((item) => {
            item.style.display = isFiltered ? 'none' : '';
        });
    }

    const buttonTemplate = `
        <button id="toggle-visibility-btn" type="button" class="btn btn-default btn-xs">
            <i class="fa fa-filter"></i><span> Hide Completed</span>
        </button>
    `.trim();

    const spanContainer = document.querySelector('span.pull-right');
    if (spanContainer) {
        spanContainer.insertAdjacentHTML('beforeend', buttonTemplate);
        document.getElementById('toggle-visibility-btn').addEventListener('click', toggleVisibility);
    } else {
        console.error('Unable to find <span class="pull-right">');
    }
})();
