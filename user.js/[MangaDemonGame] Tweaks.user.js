// ==UserScript==
// @name          [MangaDemonGame] Tweaks
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Various UI tweaks for MangaDemonGame (demonicscans.org).
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           mangademon.com
// @version       1.0.2

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[MangaDemonGame]%20Tweaks.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[MangaDemonGame]%20Tweaks.user.js

// @match         https://demonicscans.org/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=demonicscans.org
// @grant         GM_getValue
// @grant         GM_setValue
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    const PAGE_TYPE = {
        achievements: () => window.location.href.includes('/achievements.php'),
        activeWave: () => window.location.href.includes('/active_wave.php'),
        battle: () => window.location.href.includes('/battle.php'),
        blacksmith: () => window.location.href.includes('/blacksmith.php'),
        chat: () => window.location.href.includes('/chat.php'),
        dashboard: () => window.location.href.includes('/game_dash.php'),
        guide: () => window.location.href.includes('/guide.php'),
        inventory: () => window.location.href.includes('/inventory.php'),
        manga: () => window.location.href.includes('/index.php'),
        merchant: () => window.location.href.includes('/merchant.php'),
        pets: () => window.location.href.includes('/pets.php'),
        stats: () => window.location.href.includes('/stats.php'),
        weekly: () => window.location.href.includes('/weekly.php'),
    };

    // Wrap the content of a tag into a <details> block
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

    // Hide a specific element by selector
    function hideElement(selector) {
        const el = document.querySelector(selector);
        if (el) {
            el.style.display = 'none';
        }
    }

    // Add a filter bar for monster types below the topbar
    function addMonsterTypeFilterBar() {
        const container = document.querySelector('.monster-container');
        if (!container) return;

        // Get all monster types present and sort alphabetically
        const cards = Array.from(container.querySelectorAll('.monster-card'));
        const types = [...new Set(cards.map(card => card.querySelector('h3')?.textContent?.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

        // Create the filter bar
        const bar = document.createElement('div');
        bar.className = 'monster-type-filter-bar';
        bar.style.cssText = `
            position: sticky;
            top: 74px;
            z-index: 9998;
            background: #181818;
            border-bottom: 1px solid #222;
            padding: 8px 0 8px 0;
            display: flex;
            gap: 10px;
            justify-content: center;
        `;

        // Load state from Tampermonkey storage
        const storageKey = 'mdg_monster_type_filters';
        let state = {};
        try { state = JSON.parse(GM_getValue(storageKey, '{}')) || {}; } catch { state = {}; }

        // Add the button to hide/show dead monsters without loot (in English)
        const deadKey = '_hide_dead';
        if (typeof state[deadKey] !== 'boolean') state[deadKey] = true; // Default: hide

        const deadBtn = document.createElement('button');
        deadBtn.textContent = state[deadKey] ? 'Hide dead without loot' : 'Show dead without loot';
        deadBtn.style.cssText = `
            padding: 6px 14px;
            border-radius: 8px;
            border: 1px solid #333;
            background: ${state[deadKey] ? '#e53935' : '#555'};
            color: #fff;
            font-weight: 600;
            cursor: pointer;
            opacity: 1;
            transition: background 0.2s;
        `;
        deadBtn.onclick = () => {
            state[deadKey] = !state[deadKey];
            GM_setValue(storageKey, JSON.stringify(state));
            deadBtn.textContent = state[deadKey] ? 'Hide dead without loot' : 'Show dead without loot';
            deadBtn.style.background = state[deadKey] ? '#e53935' : '#555';
            updateCards();
        };
        bar.appendChild(deadBtn);

        // Add monster type buttons (sorted)
        types.forEach(type => {
            const btn = document.createElement('button');
            btn.textContent = type;
            btn.style.cssText = `
                padding: 6px 14px;
                border-radius: 8px;
                border: 1px solid #333;
                background: ${state[type] === false ? '#292929' : '#4caf50'};
                color: #fff;
                font-weight: 600;
                cursor: pointer;
                opacity: ${state[type] === false ? 0.5 : 1};
                transition: background 0.2s, opacity 0.2s;
            `;
            btn.dataset.type = type;
            btn.onclick = () => {
                state[type] = state[type] === false ? true : false;
                GM_setValue(storageKey, JSON.stringify(state));
                updateCards();
                btn.style.background = state[type] === false ? '#292929' : '#4caf50';
                btn.style.opacity = state[type] === false ? 0.5 : 1;
            };
            bar.appendChild(btn);
        });

        // Insert the filter bar after the topbar
        const topbar = document.querySelector('.game-topbar');
        if (topbar) topbar.insertAdjacentElement('afterend', bar);

        // Show/hide monster cards according to filter state
        function updateCards() {
            cards.forEach(card => {
                const type = card.querySelector('h3')?.textContent?.trim();
                const hpFill = card.querySelector('.hp-fill');
                const isDead = hpFill && hpFill.style.width === '0%';
                const hasLoot = card.querySelector('a > .join-btn');
                if (type && state[type] === false) {
                    card.style.display = 'none';
                }
                else if (isDead && !hasLoot && state[deadKey]) {
                    card.style.display = 'none';
                }
                else {
                    card.style.display = '';
                }
            });
        }
        updateCards();
    }

    // Add a compact game menu bar with icon buttons above the filter bar
    function addGameMenuBar() {
        const menu = [
            { href: "inventory.php", img: "images/menu/compressed_chest.webp", alt: "Inventory", title: "Inventory" },
            { href: "pets.php", img: "images/menu/compressed_eggs_menu.webp", alt: "Pets", title: "Pets" },
            { href: "stats.php", img: "images/menu/compressed_stats_menu.webp", alt: "Stats", title: "Stats" },
            { href: "blacksmith.php", img: "images/menu/compressed_crafting.webp", alt: "Blacksmith", title: "Blacksmith" },
            { href: "merchant.php", img: "images/menu/compressed_merchant.webp", alt: "Merchant", title: "Merchant" },
            { href: "achievements.php", img: "images/menu/compressed_achievments.webp", alt: "Achievements", title: "Achievements" },
            { href: "guide.php", img: "images/menu/compressed_guide.webp", alt: "How To Play", title: "How To Play" },
            { href: "weekly.php", img: "images/menu/weekly_leaderboard.webp", alt: "Weekly Leaderboard", title: "Weekly Leaderboard" },
            { href: "chat.php", img: "images/menu/compressed_chat.webp", alt: "Global Chat", title: "Global Chat" }
        ];
        const bar = document.createElement('div');
        bar.className = 'game-menu-bar';
        bar.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 14px;
            background: #191919;
            border-bottom: 1px solid #232323;
            padding: 6px 0 4px 0;
            position: sticky;
            top: 48px;
            z-index: 9999;
        `;
        menu.forEach(item => {
            const a = document.createElement('a');
            a.href = item.href;
            a.title = item.title;
            a.style.cssText = `
                display: flex;
                flex-direction: row;
                align-items: center;
                text-decoration: none;
                color: #fff;
                font-size: 13px;
                min-width: 160px;
                max-width: 240px;
                padding: 3px 16px 3px 8px;
                border-radius: 7px;
                gap: 12px;
                transition: background 0.15s;
            `;
            a.onmouseover = () => { a.style.background = "#232323"; };
            a.onmouseout = () => { a.style.background = "none"; };
            const img = document.createElement('img');
            img.src = item.img;
            img.alt = item.alt;
            img.style.cssText = "width:22px;height:22px;display:block;filter:drop-shadow(0 0 1px #0008);";
            const span = document.createElement('span');
            span.textContent = item.title;
            span.style.cssText = "font-size:13px;line-height:1.1;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;";
            a.appendChild(img);
            a.appendChild(span);
            bar.appendChild(a);
        });
        const topbar = document.querySelector('.game-topbar');
        if (topbar) topbar.insertAdjacentElement('afterend', bar);
    }

    // Add a toggle button to show/hide completed achievements on the achievements page
    function addAchievementsToggleButton() {
        // Find the panel and the h1 title
        const panel = document.querySelector('.panel');
        const h1 = panel?.querySelector('h1');
        if (!panel || !h1) return;

        // Create the toggle button
        const btn = document.createElement('button');
        btn.textContent = 'Hide completed';
        btn.type = 'button';
        btn.style.cssText = `
            margin-left: 14px;
            padding: 4px 12px;
            border-radius: 7px;
            border: 1px solid #333;
            background: #4caf50;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        `;

        // Load state from storage
        const storageKey = 'mdg_hide_completed_achievements';
        let hideCompleted = GM_getValue(storageKey, '0') === '1';

        // Update button and cards according to state
        function update() {
            btn.textContent = hideCompleted ? 'Show completed' : 'Hide completed';
            btn.style.background = hideCompleted ? '#e53935' : '#4caf50';
            // For each achievement card, check if completed (progress is 100%)
            document.querySelectorAll('.panel .card').forEach(card => {
                const percent = card.querySelector('.row > div:last-child');
                if (percent && percent.textContent.trim() === '100%') {
                    card.style.display = hideCompleted ? 'none' : '';
                } else {
                    card.style.display = '';
                }
            });
        }

        btn.onclick = () => {
            hideCompleted = !hideCompleted;
            GM_setValue(storageKey, hideCompleted ? '1' : '0');
            update();
        };

        // Insert the button next to the h1 title
        h1.insertAdjacentElement('afterend', btn);
        update();
    }

    /** MAIN SECTION */
    window.addEventListener('load', function () {
        if (PAGE_TYPE.achievements()) {
            addAchievementsToggleButton();
        } else if (PAGE_TYPE.activeWave()) {
            encapsulateDetails('.gate-info', 'Gate Info');
            addMonsterTypeFilterBar();
        } else if (PAGE_TYPE.battle()) {
            hideElement('#monsterImage');
        } else if (PAGE_TYPE.dashboard()) {
            encapsulateDetails('.howto-info', 'How to Play');
        }

        if (
            PAGE_TYPE.achievements() ||
            PAGE_TYPE.activeWave() ||
            PAGE_TYPE.battle() ||
            PAGE_TYPE.blacksmith() ||
            PAGE_TYPE.chat() ||
            PAGE_TYPE.dashboard() ||
            PAGE_TYPE.guide() ||
            PAGE_TYPE.inventory() ||
            PAGE_TYPE.merchant() ||
            PAGE_TYPE.pets() ||
            PAGE_TYPE.stats() ||
            PAGE_TYPE.weekly()
        ) {
            addGameMenuBar();
        }
    });

})();
