// ==UserScript==
// @name          [D4Builds] JsonExporterForDiablo4Companion
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   DL Json for Diablo Compagnon
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           d4builds.gg
// @version       0.3

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[D4Builds]%20JsonExporterForDiablo4Companion.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[D4Builds]%20JsonExporterForDiablo4Companion.user.js

// @match         https://d4builds.gg/builds/*/*
// @match         https://d4builds.gg/database/gear-affixes/
// @icon          https://www.google.com/s2/favicons?sz=64&domain=d4builds.gg
// @grant         GM_registerMenuCommand
// @run-at        document-end
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    // Add menu command for builds page
    if (window.location.href.match(/https:\/\/d4builds\.gg\/builds\/[^/]+\/[^/]+/)) {
        GM_registerMenuCommand(
            'DL Json for Diablo Compagnon',
            function () {
                function getAllAffixes(category) {
                    var res = {
                        stats: [],
                        tempering: [],
                    };
                    document.querySelectorAll(`:scope .${category} .filled`).forEach((e) => {
                        if (e.querySelector('.dropdown__button__tempering')) {
                            res.tempering.push(e.innerText);
                        } else {
                            res.stats.push(e.innerText);
                        }
                    });
                    return res;
                }

                function getAllAspects() {
                    var res = [];
                    document.querySelectorAll(`:scope .builder__gear__name`).forEach((e) => res.push(e.innerText));
                    res = res.filter(function (e) {
                        return e.includes('Aspect');
                    });
                    return res;
                }

                function getClass() {
                    switch (document.querySelector('.builder__header__description').firstChild.textContent) {
                        case 'Sorcerer':
                            return 0;
                        case 'Druid':
                            return 1;
                        case 'Barbarian':
                            return 2;
                        case 'Rogue':
                            return 3;
                        case 'Necromancer':
                            return 4;
                        case 'Spiritborn':
                            return 5;
                        default:
                            return null;
                    }
                }

                var result = {};
                result.Name = document.querySelector('#renameBuild').value;
                result.D4Class = getClass();

                result.Aspects = getAllAspects();

                result.Helm = getAllAffixes('Helm');
                result.ChestArmor = getAllAffixes('ChestArmor');
                result.Gloves = getAllAffixes('Gloves');
                result.Pants = getAllAffixes('Pants');
                result.Boots = getAllAffixes('Boots');
                result.Amulet = getAllAffixes('Amulet');
                result.Ring1 = getAllAffixes('Ring1');
                result.Ring2 = getAllAffixes('Ring2');

                if (document.querySelector('.Weapon')) result.Weapon = getAllAffixes('Weapon');
                if (document.querySelector('.Offhand')) result.Offhand = getAllAffixes('Offhand');
                if (document.querySelector('.RangedWeapon')) result.Weapon = getAllAffixes('RangedWeapon');
                if (document.querySelector('.BludgeoningWeapon')) result.BludgeoningWeapon = getAllAffixes('BludgeoningWeapon');
                if (document.querySelector('.SlashingWeapon')) result.SlashingWeapon = getAllAffixes('SlashingWeapon');
                if (document.querySelector('.WieldWeapon1')) result.WieldWeapon1 = getAllAffixes('WieldWeapon1');
                if (document.querySelector('.WieldWeapon2')) result.WieldWeapon2 = getAllAffixes('WieldWeapon2');

                // console.debug(result);
                console.debug(JSON.stringify(result, null, 2));
            },
            'd'
        );
    }

    // Add menu command for gear-affixes page
    if (window.location.href.includes('/database/gear-affixes/')) {
        GM_registerMenuCommand(
            'DL Json for Affixes Database',
            function () {
                function getAllSlotAffixes(slotName) {
                    var stats = [];
                    var implicitStats = [];

                    // Get the slot element
                    const slotElement = Array.from(document.querySelectorAll('.stats__slot')).find(
                        (slot) => slot.querySelector('.stats__slot__name').textContent === slotName
                    );

                    if (slotElement) {
                        // Get all stats sections
                        const sections = slotElement.querySelectorAll('.stats__slot__all__values .stats__slot_title');

                        sections.forEach((section) => {
                            let currentSection = section;
                            let values = [];

                            // Get all stats until next section or end
                            while (currentSection.nextElementSibling && !currentSection.nextElementSibling.classList.contains('stats__slot_title')) {
                                values.push(currentSection.nextElementSibling.textContent);
                                currentSection = currentSection.nextElementSibling;
                            }

                            // Add to appropriate array based on section title
                            if (section.textContent === 'Implicit') {
                                implicitStats.push(...values);
                            } else if (section.textContent === 'Stats') {
                                stats.push(...values);
                            }
                        });
                    }

                    return {
                        implicitStats,
                        stats,
                    };
                }

                var result = {
                    Helm: getAllSlotAffixes('Helm'),
                    ChestArmor: getAllSlotAffixes('Chest Armor'),
                    Gloves: getAllSlotAffixes('Gloves'),
                    Pants: getAllSlotAffixes('Pants'),
                    Boots: getAllSlotAffixes('Boots'),
                    Amulet: getAllSlotAffixes('Amulet'),
                    Ring: getAllSlotAffixes('Ring'),
                    Weapon: getAllSlotAffixes('Weapon'),
                    Offhand: getAllSlotAffixes('Offhand'),
                    Shield: getAllSlotAffixes('Shield'),
                };

                console.debug(JSON.stringify(result, null, 2));
            },
            'a'
        );
    }
})();
