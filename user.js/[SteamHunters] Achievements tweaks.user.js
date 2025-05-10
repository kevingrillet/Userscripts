// ==UserScript==
// @name          [SteamHunters] Achievements tweaks
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Adds a button to toggle visibility of completed updates (100%) and unlocked achievements on SteamHunters
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           steamhunters.com
// @version       1.0.3

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[SteamHunters]%20Achievements%20tweaks.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[SteamHunters]%20Achievements%20tweaks.user.js

// @match         https://steamhunters.com/id/*/apps/*/achievements
// @icon          https://www.google.com/s2/favicons?sz=64&domain=steamhunters.com
// @grant         GM_getValue
// @grant         GM_setValue
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    let isFiltered = GM_getValue('isFiltered', false);

    function applyFilter() {
        const button = document.getElementById('toggle-visibility-btn');
        if (!button) return;

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

    function toggleVisibility() {
        isFiltered = !isFiltered;
        GM_setValue('isFiltered', isFiltered);
        applyFilter();
    }

    function initButton() {
        const buttonTemplate = `
            <button id="toggle-visibility-btn" type="button" class="btn btn-default btn-xs">
                <i class="fa fa-filter"></i><span> Hide Completed</span>
            </button>
        `.trim();

        const spanContainer = document.querySelector('span.pull-right');
        if (spanContainer && !document.getElementById('toggle-visibility-btn')) {
            spanContainer.insertAdjacentHTML('beforeend', buttonTemplate);
            document.getElementById('toggle-visibility-btn').addEventListener('click', toggleVisibility);
            applyFilter();
        }
    }

    // Observer for dynamic content
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                initButton();
                applyFilter();
            }
        }
    });

    // Start observing
    const targetNode = document.querySelector('.achievements');
    if (targetNode) {
        observer.observe(targetNode, { childList: true, subtree: true });
    }

    // Initial setup
    initButton();
    applyFilter();
})();
