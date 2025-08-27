// ==UserScript==
// @name          [MangaDemonGame] Tweaks
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Various UI tweaks for MangaDemonGame (demonicscans.org).
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           mangademon.com
// @version       1.0.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[MangaDemonGame]%20Tweaks.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[MangaDemonGame]%20Tweaks.user.js

// @match         https://demonicscans.org/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=demonicscans.org
// @grant         none
// @run-at        document-end
// ==/UserScript==

(function () {
    ('use strict');

    const PAGE_TYPE = {
        activeWave: () => window.location.href.includes('/active_wave.php'),
        battle: () => window.location.href.includes('/battle.php'),
        dashboard: () => window.location.href.includes('/game_dash.php'),
    };

    // Encapsulate content of a tag into a <details> block
    function encapsulateDetails(tag, title) {
        const content = document.querySelector(tag);
        if (!content) return;

        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = title;

        details.appendChild(summary);
        details.appendChild(content.cloneNode(true));

        content.replaceWith(details);
    }

    // Hide all dead monster cards if there is no loot to claim
    function hideDeadMonsterCards() {
        document.querySelectorAll('.monster-card').forEach((card) => {
            const hpFill = card.querySelector('.hp-fill');
            const isDead = hpFill && hpFill.style.width === '0%';
            const hasLoot = card.querySelector('a > .join-btn');
            if (isDead && !hasLoot) {
                card.style.display = 'none';
            }
        });
    }

    // Hide a specific element by selector
    function hideElement(selector) {
        const el = document.querySelector(selector);
        if (el) {
            el.style.display = 'none';
        }
    }

    /** MAIN SECTION */
    window.addEventListener('load', function () {
        if (PAGE_TYPE.activeWave()) {
            encapsulateDetails('.gate-info', 'Gate Info');
            hideDeadMonsterCards();
        } else if (PAGE_TYPE.battle()) {
            hideElement('#monsterImage');
        } else if (PAGE_TYPE.dashboard()) {
            encapsulateDetails('.howto-info', 'How to Play');
        }
    });
})();
