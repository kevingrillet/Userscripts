// ==UserScript==
// @name          [Steam] Steam Search
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Add menu commands to search the current Steam game on DLCompare, G2A, InstantGaming, and Kinguin
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           steampowered.com
// @version       1.0.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Steam]%20Steam%20Search.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Steam]%20Steam%20Search.user.js

// @match         https://store.steampowered.com/app/*/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=steampowered.com
// @grant         GM_registerMenuCommand
// @grant         GM_openInTab
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    // Get the game name from the Steam page
    function getGameName() {
        const el = document.querySelector('.apphub_AppName');
        return el ? el.textContent.trim() : '';
    }

    // Open a new tab with the given URL
    function openInTab(url) {
        if (typeof GM_openInTab === 'function') {
            GM_openInTab(url, { active: true });
        } else {
            window.open(url, '_blank');
        }
    }

    // Generate search URLs for each site
    function getUrls(gameName) {
        const encoded = encodeURIComponent(gameName);
        return [
            { label: 'DLCompare', url: `https://www.dlcompare.fr/search?q=${encoded}` },
            { label: 'G2A', url: `https://www.g2a.com/search?query=${encoded}` },
            { label: 'InstantGaming', url: `https://www.instant-gaming.com/fr/rechercher/?q=${encoded}` },
            { label: 'Kinguin', url: `https://www.kinguin.net/listing?production_products_bestsellers_desc%5Bquery%5D=${encoded}` },
        ];
    }

    // Register Tampermonkey menu commands for each site
    function registerMenuCommands() {
        const gameName = getGameName();
        if (!gameName) return;

        getUrls(gameName).forEach(({ label, url }) => {
            GM_registerMenuCommand(`🔎 Search on ${label}`, () => openInTab(url));
        });
    }

    window.addEventListener('DOMContentLoaded', registerMenuCommands);
})();
