// ==UserScript==
// @name          [Cookie Clicker] CookieMonster AutoBuyer
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Automatically buys researches, upgrades & buildings with configurable priority and strategy.
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           cookieclicker
// @version       1.0.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Cookie%20Clicker]%20CookieMonster%20AutoBuyer.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Cookie%20Clicker]%20CookieMonster%20AutoBuyer.user.js

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

    const AutoAscendMode = Object.freeze({
        NEVER: 0, // Never auto ascend
        UNTIL_ENDLESS: 1, // Ascend until HF Endless cycle achievement (id 207) is unlocked
        ALWAYS: 2, // Always auto ascend when possible
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
    let isEnabled = GM_getValue('autobuy_enabled', false);
    let intervalSeconds = GM_getValue('autobuy_interval', 5);
    let debugMode = GM_getValue('autobuy_debug', false);
    let upgradeMode = GM_getValue('autobuy_upgradeMode', UpgradeMode.BLUE_GREEN_GRAY);
    let techStrategy = GM_getValue('autobuy_techStrategy', TechStrategy.AUTO);
    let purchaseStrategy = GM_getValue('autobuy_strategy', PurchaseStrategy.NO_WAIT);
    let upgradeBuildings = GM_getValue('autobuy_upgradeBuildings', true);
    let autoHandOfFate = GM_getValue('autobuy_autoHandOfFate', true);
    let autoAscendMode = GM_getValue('autobuy_autoAscendMode', AutoAscendMode.NEVER);

    let intervalId = null;

    // Store menu IDs to cleanly refresh menu entries
    let menuToggleId, menuIntervalId, menuDebugId, menuUpgradeId, menuTechId, menuStrategyId, menuUpgradeBuildingsId, menuHandOfFateId, menuAutoAscendId;

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
        if (upgradeMode === UpgradeMode.NONE) return [];

        const upgrades = document.querySelectorAll(`${selector} .upgrade.enabled`);
        const modeClasses = [];
        if (upgradeMode >= UpgradeMode.BLUE) modeClasses.push(CLASS_BLUE_UPGRADE);
        if (upgradeMode >= UpgradeMode.BLUE_GREEN) modeClasses.push(CLASS_GREEN_UPGRADE);
        if (upgradeMode >= UpgradeMode.BLUE_GREEN_GRAY) modeClasses.push(CLASS_GRAY_UPGRADE);

        return Array.from(upgrades).filter((el) => modeClasses.some((cls) => el.querySelector(`.${cls}`)));
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
    function showGameNotification(title, message, type = 'notice') {
        if (typeof Game !== 'undefined' && Game.Notify) {
            Game.Notify(title, message, null, type);
        } else {
            alert(`[${title}] ${message}`);
        }
    }

    function buyNext() {
        try {
            // 1️⃣ 🔬 Researches first
            if (techStrategy === TechStrategy.AUTO) {
                const researches = getEligibleResearches();
                if (researches.length > 0) {
                    logDebug('Buying research:', researches[0].title);
                    const upgradeId = researches[0].getAttribute('data-id');
                    if (upgradeId && Game.UpgradesById[upgradeId]) {
                        Game.UpgradesById[upgradeId].buy();
                        confirmPromptIfVisible(); // click OK if needed
                        return true;
                    }
                }
            }

            // 2️⃣ 🟦🟩⬜ Upgrades
            const upgrades = getEligibleUpgrades();
            const blueUpgradesRemaining = upgrades.some((el) => el.querySelector(`.${CLASS_BLUE_UPGRADE}`));

            if (upgrades.length > 0) {
                logDebug('Buying eligible upgrade:', upgrades[0].title);
                const upgradeId = upgrades[0].getAttribute('data-id');
                if (upgradeId && Game.UpgradesById[upgradeId]) {
                    Game.UpgradesById[upgradeId].buy();
                    return true;
                }
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
                    const buildingId = parent.getAttribute('data-id');
                    if (buildingId && Game.ObjectsById[buildingId]) {
                        let bulkAmount = Game.buyBulk > 0 ? Game.buyBulk : 1;
                        logDebug('Auto-buying building:', Game.ObjectsById[buildingId].name, 'x', bulkAmount);
                        Game.ObjectsById[buildingId].buy(bulkAmount);
                        return true;
                    }
                }
            }

            return false;
        } catch (err) {
            logDebug('Error in buyNext:', err);
            showGameNotification('AutoBuyer Error', err.message || String(err), 'alert');
            return false;
        }
    }

    function handOfFateLogic() {
        if (!autoHandOfFate) return;
        const grimoire = Game.Objects.ById[7]?.minigame;
        if (!grimoire) return;
        const spell = grimoire.spells['hand of fate'];
        if (!spell) return;

        // Mana full and enough for spell
        if (grimoire.magic === grimoire.magicM && grimoire.magic > spell.costMin + grimoire.magicM * spell.costPercent) {
            grimoire.castSpell(spell);
            // Pop golden cookies
            Game.shimmers.forEach(function (shimmer) {
                if (shimmer.type === 'golden' && shimmer.wrath === 0) shimmer.pop();
            });
        }
    }

    function autoAscendLogic() {
        if (autoAscendMode === AutoAscendMode.NEVER) return;
        if (autoAscendMode === AutoAscendMode.UNTIL_ENDLESS && Game.AchievementsById[207]?.won) return;
        // Ascend if at least 1 prestige is available
        if (Game.HowMuchPrestige(Game.cookiesEarned) >= 1 && Game.OnAscend === 0 && Game.AscendTimer === 0) {
            logDebug('Auto ascending: 1 prestige available');
            Game.Ascend(1);
            return;
        }
        // If on ascend screen, auto click "Reincarnate"
        if (Game.OnAscend === 1 && Game.AscendTimer === 0) {
            logDebug('Auto calling Game.Reincarnate()');
            Game.Reincarnate();
        }
    }

    // ==========================
    //  ⏲️ Interval Control
    // ==========================
    function startAutoBuy() {
        if (intervalId) clearInterval(intervalId);

        intervalId = setInterval(() => {
            function processBuys() {
                let boughtSomething = buyNext();
                handOfFateLogic();
                autoAscendLogic();
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
        [
            menuToggleId,
            menuIntervalId,
            menuDebugId,
            menuUpgradeId,
            menuStrategyId,
            menuTechId,
            menuUpgradeBuildingsId,
            menuHandOfFateId,
            menuAutoAscendId,
        ].forEach((id) => {
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

    function getHandOfFateLabel() {
        return `Auto Hand of Fate: ${autoHandOfFate ? 'ON' : 'OFF'}`;
    }

    function getAutoAscendModeLabel() {
        switch (autoAscendMode) {
            case AutoAscendMode.NEVER:
                return 'Auto Ascend: 🚫 Never';
            case AutoAscendMode.UNTIL_ENDLESS:
                return 'Auto Ascend: ⏩ Until Endless Cycle';
            case AutoAscendMode.ALWAYS:
                return 'Auto Ascend: ♾️ Always';
        }
    }

    function registerMenu() {
        menuToggleId = GM_registerMenuCommand(`AutoBuyer: ${isEnabled ? 'Disable' : 'Enable'}`, toggleAutoBuy);
        menuIntervalId = GM_registerMenuCommand(`Set interval (current: ${intervalSeconds}s)`, changeInterval);
        menuDebugId = GM_registerMenuCommand(`Debug mode: ${debugMode ? 'ON' : 'OFF'}`, toggleDebug);
        menuUpgradeId = GM_registerMenuCommand(getUpgradeLabel(), cycleUpgradeMode);
        menuTechId = GM_registerMenuCommand(getTechLabel(), cycleTechStrategy);
        menuStrategyId = GM_registerMenuCommand(getStrategyLabel(), cycleStrategy);
        menuUpgradeBuildingsId = GM_registerMenuCommand(getUpgradeBuildingsLabel(), toggleUpgradeBuildings);
        menuHandOfFateId = GM_registerMenuCommand(getHandOfFateLabel(), toggleHandOfFate);
        menuAutoAscendId = GM_registerMenuCommand(getAutoAscendModeLabel(), cycleAutoAscendMode);
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
        const newVal = prompt('Enter new interval in seconds (1-60):', intervalSeconds);
        if (newVal !== null) {
            const num = parseInt(newVal, 10);
            if (!isNaN(num) && num >= 1 && num <= 60) {
                intervalSeconds = num;
                GM_setValue('autobuy_interval', intervalSeconds);
                if (isEnabled) startAutoBuy();
                refreshMenu();
            } else {
                showGameNotification('AutoBuyer', 'Interval must be between 1 and 60 seconds.', 'alert');
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

    function toggleHandOfFate() {
        autoHandOfFate = !autoHandOfFate;
        GM_setValue('autobuy_autoHandOfFate', autoHandOfFate);
        refreshMenu();
    }

    function cycleAutoAscendMode() {
        const totalModes = Object.keys(AutoAscendMode).length;
        autoAscendMode = (autoAscendMode + 1) % totalModes;
        GM_setValue('autobuy_autoAscendMode', autoAscendMode);
        refreshMenu();
    }

    // ==========================
    //  🚀 Init
    // ==========================
    registerMenu();
    if (isEnabled) setTimeout(startAutoBuy, 5 * 1000);
})();
