// ==UserScript==
// @name          [Cookie Clicker] CookieMonster AutoBuyer
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Automatically buys researches, upgrades & buildings with configurable priority and strategy.
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           cookieclicker
// @version       1.0.0
//
// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Cookie%20Clicker]%20CookieMonster%20AutoBuyer.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Cookie%20Clicker]%20CookieMonster%20AutoBuyer.user.js
//
// @match         https://orteil.dashnet.org/cookieclicker/*
// @icon          https://www.google.com/s2/favicons?domain=orteil.dashnet.org
// @grant         GM_registerMenuCommand
// @grant         GM_unregisterMenuCommand
// @grant         GM_getValue
// @grant         GM_setValue
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    // ==========================
    //  ⚙️ Defaults
    // ==========================
    const DEFAULT_INTERVAL = 5; // ⏱️ Check every 5 seconds
    const DEFAULT_ENABLED = false; // ❌ Disabled by default
    const DEFAULT_DEBUG = false; // ❌ Debug mode off by default

    // 🎨 Default modes: buy all upgrades (🟦+🟩+⬜) and ⏸️ wait for blue upgrades before buildings
    const DEFAULT_UPGRADE_MODE = 3; // BLUE_GREEN_GRAY
    const DEFAULT_STRATEGY = 1; // WAIT_BLUE

    // ==========================
    //  📊 Enums (Modes)
    // ==========================
    const UpgradeMode = Object.freeze({
        NONE: 0, // 🏢💨 No upgrades, only buildings
        BLUE: 1, // 🟦 Only blue upgrades
        BLUE_GREEN: 2, // 🟦 + 🟩
        BLUE_GREEN_GRAY: 3, // 🟦 + 🟩 + ⬜
    });

    const TechStrategy = Object.freeze({
        NONE: 0, // 🚫 Never buy researches
        AUTO: 1, // 🤖 Automatically buy + confirm prompts
    });

    const PurchaseStrategy = Object.freeze({
        NO_WAIT: 0, // 🚀 Buy buildings even if blue upgrades are available
        WAIT_BLUE: 1, // ⏸️ Wait until all blue upgrades are bought before buying buildings
    });

    // ==========================
    //  🎨 Classes / Color selectors
    // ==========================
    const COLOR_GREEN = 'rgb(0, 255, 0)';
    const CLASS_BLUE_UPGRADE = 'CMBackBlue'; // 🟦
    const CLASS_GREEN_UPGRADE = 'CMBackGreen'; // 🟩
    const CLASS_GRAY_UPGRADE = 'CMBackGray'; // ⬜

    // ==========================
    //  💾 State
    // ==========================
    let isEnabled = GM_getValue('autobuy_enabled', DEFAULT_ENABLED);
    let intervalSeconds = GM_getValue('autobuy_interval', DEFAULT_INTERVAL);
    let debugMode = GM_getValue('autobuy_debug', DEFAULT_DEBUG);
    let upgradeMode = GM_getValue('autobuy_upgradeMode', DEFAULT_UPGRADE_MODE);
    let techStrategy = GM_getValue('autobuy_techStrategy', TechStrategy.AUTO);
    let purchaseStrategy = GM_getValue('autobuy_strategy', DEFAULT_STRATEGY);
    let upgradeBuildings = GM_getValue('autobuy_upgradeBuildings', true); // Default: true

    let intervalId = null;

    // Store menu IDs to cleanly refresh menu entries
    let menuToggleId, menuIntervalId, menuDebugId, menuUpgradeId, menuTechId, menuStrategyId, menuUpgradeBuildingsId;

    function logDebug(...args) {
        if (debugMode) console.log('[AutoBuyer DEBUG]', ...args);
    }

    function confirmPromptIfVisible() {
        // Select the "Yes" button in the prompt if visible and check its text
        const okButton = document.querySelector('#promptOption0.option');
        if (
            okButton &&
            okButton.offsetParent !== null && // visible
            okButton.innerText.trim().toLowerCase() === 'yes'
        ) {
            logDebug('Confirming popup:', okButton.innerText);
            okButton.click();
            return true;
        }
        return false;
    }

    // ==========================
    //  🧮 Bulk Buy Handling
    // ==========================
    function ensureCorrectBulkSelected() {
        // ✅ Ensure the green bulk button (1/10/100) is selected
        const greenBulk = document.querySelector(`#storeBulk .storeBulkAmount[style*="${COLOR_GREEN}"]`);
        if (greenBulk && !greenBulk.classList.contains('selected')) {
            logDebug('Fixing bulk mode → clicking', greenBulk.innerText);
            greenBulk.click();
        }
    }

    // ==========================
    //  🧠 Upgrade/Research Selection
    // ==========================
    function getEligibleItems(selector) {
        // 🏢💨 No upgrades at all in NONE mode
        if (upgradeMode === UpgradeMode.NONE) return [];

        return Array.from(document.querySelectorAll(`${selector} .upgrade.enabled`)).filter((el) => {
            const hasBlue = el.querySelector(`.${CLASS_BLUE_UPGRADE}`); // 🟦
            const hasGreen = el.querySelector(`.${CLASS_GREEN_UPGRADE}`); // 🟩
            const hasGray = el.querySelector(`.${CLASS_GRAY_UPGRADE}`); // ⬜

            switch (upgradeMode) {
                case UpgradeMode.BLUE:
                    return hasBlue;
                case UpgradeMode.BLUE_GREEN:
                    return hasBlue || hasGreen;
                case UpgradeMode.BLUE_GREEN_GRAY:
                    return hasBlue || hasGreen || hasGray;
                default:
                    return false;
            }
        });
    }

    function getEligibleResearches() {
        return getEligibleItems('#techUpgrades');
    }

    function getEligibleUpgrades() {
        return getEligibleItems('#upgrades');
    }

    // ==========================
    //  🤖 Core Auto-Buy Logic
    // ==========================
    function buyNext() {
        // 1️⃣ 🔬 Researches first
        if (techStrategy === TechStrategy.AUTO) {
            const researches = getEligibleResearches();
            if (researches.length > 0) {
                logDebug('Buying research:', researches[0].title);
                researches[0].click();
                confirmPromptIfVisible(); // click OK if needed
                return true;
            }
        }

        // 2️⃣ 🟦🟩⬜ Upgrades
        const upgrades = getEligibleUpgrades();
        const blueUpgradesRemaining = upgrades.some((el) => el.querySelector(`.${CLASS_BLUE_UPGRADE}`));

        if (upgrades.length > 0) {
            logDebug('Buying eligible upgrade:', upgrades[0].title);
            upgrades[0].click();
            return true;
        }

        // 3️⃣ ⏸️ If strategy is WAIT_BLUE
        if (purchaseStrategy === PurchaseStrategy.WAIT_BLUE && blueUpgradesRemaining) {
            logDebug('⏸️ Waiting for blue upgrades before buying buildings');
            return false;
        }

        // 4️⃣ 🏢 Buildings (only if upgradeBuildings is true)
        if (upgradeBuildings) {
            ensureCorrectBulkSelected();
            const product = document.querySelector(`#products .product.enabled .price[style*="${COLOR_GREEN}"]`);
            if (product) {
                const parent = product.closest('.product');
                const title = parent.querySelector('.title')?.innerText || parent.id;
                logDebug('Auto-buying building:', title);
                parent.click();
                return true;
            }
        }

        return false;
    }

    // ==========================
    //  ⏲️ Interval Control
    // ==========================
    function startAutoBuy() {
        if (intervalId) clearInterval(intervalId);

        intervalId = setInterval(() => {
            function processBuys() {
                let boughtSomething = buyNext();
                if (boughtSomething) {
                    setTimeout(processBuys, 50);
                }
            }
            processBuys();
        }, intervalSeconds * 1000);

        logDebug('AutoBuyer started. Interval:', intervalSeconds, 'seconds');
    }

    function stopAutoBuy() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        logDebug('AutoBuyer stopped.');
    }

    // ==========================
    //  🧭 Menu Management
    // ==========================
    function unregisterMenu() {
        [menuToggleId, menuIntervalId, menuDebugId, menuUpgradeId, menuStrategyId, menuTechId].forEach((id) => {
            if (id) GM_unregisterMenuCommand(id);
        });
    }

    function getUpgradeLabel() {
        switch (upgradeMode) {
            case UpgradeMode.NONE:
                return 'Upgrade mode: 🏢💨 None (buildings only)';
            case UpgradeMode.BLUE:
                return 'Upgrade mode: 🟦 Blue only';
            case UpgradeMode.BLUE_GREEN:
                return 'Upgrade mode: 🟦 + 🟩';
            case UpgradeMode.BLUE_GREEN_GRAY:
                return 'Upgrade mode: 🟦 + 🟩 + ⬜';
        }
    }

    function getTechLabel() {
        return techStrategy === TechStrategy.NONE ? 'Tech purchase: 🚫 Disabled' : 'Tech purchase: 🤖 Auto-buy';
    }

    function getStrategyLabel() {
        return purchaseStrategy === PurchaseStrategy.NO_WAIT ? 'Building strategy: 🚀 No wait' : 'Building strategy: ⏸️ Wait for Blue upgrades';
    }

    function getUpgradeBuildingsLabel() {
        return `Upgrade buildings: ${upgradeBuildings ? 'ON' : 'OFF'}`;
    }

    function registerMenu() {
        menuToggleId = GM_registerMenuCommand(`AutoBuyer: ${isEnabled ? 'Disable' : 'Enable'}`, toggleAutoBuy);
        menuIntervalId = GM_registerMenuCommand(`Set interval (current: ${intervalSeconds}s)`, changeInterval);
        menuDebugId = GM_registerMenuCommand(`Debug mode: ${debugMode ? 'ON' : 'OFF'}`, toggleDebug);
        menuUpgradeId = GM_registerMenuCommand(getUpgradeLabel(), cycleUpgradeMode);
        menuTechId = GM_registerMenuCommand(getTechLabel(), cycleTechStrategy);
        menuStrategyId = GM_registerMenuCommand(getStrategyLabel(), cycleStrategy);
        menuUpgradeBuildingsId = GM_registerMenuCommand(getUpgradeBuildingsLabel(), toggleUpgradeBuildings);
    }

    function refreshMenu() {
        unregisterMenu();
        registerMenu();
    }

    function toggleAutoBuy() {
        isEnabled = !isEnabled;
        GM_setValue('autobuy_enabled', isEnabled);
        isEnabled ? startAutoBuy() : stopAutoBuy();
        refreshMenu();
    }

    function changeInterval() {
        const newVal = prompt('Enter new interval in seconds:', intervalSeconds);
        if (newVal !== null) {
            const num = parseInt(newVal, 10);
            if (!isNaN(num) && num > 0) {
                intervalSeconds = num;
                GM_setValue('autobuy_interval', intervalSeconds);
                if (isEnabled) startAutoBuy();
                refreshMenu();
            }
        }
    }

    function toggleDebug() {
        debugMode = !debugMode;
        GM_setValue('autobuy_debug', debugMode);
        refreshMenu();
    }

    function cycleUpgradeMode() {
        const totalModes = Object.keys(UpgradeMode).length;
        upgradeMode = (upgradeMode + 1) % totalModes;
        GM_setValue('autobuy_upgradeMode', upgradeMode);
        refreshMenu();
    }

    function cycleTechStrategy() {
        techStrategy = (techStrategy + 1) % Object.keys(TechStrategy).length;
        GM_setValue('autobuy_techStrategy', techStrategy);
        refreshMenu();
    }

    function cycleStrategy() {
        purchaseStrategy = (purchaseStrategy + 1) % Object.keys(PurchaseStrategy).length;
        GM_setValue('autobuy_strategy', purchaseStrategy);
        refreshMenu();
    }

    function toggleUpgradeBuildings() {
        upgradeBuildings = !upgradeBuildings;
        GM_setValue('autobuy_upgradeBuildings', upgradeBuildings);
        refreshMenu();
    }

    // ==========================
    //  🚀 Init
    // ==========================
    registerMenu();
    if (isEnabled) setTimeout(startAutoBuy, 5 * 1000);
})();
