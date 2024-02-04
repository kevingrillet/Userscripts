// ==UserScript==
// @name          [D4Builds] JsonExporterForDiablo4Companion
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   DL Json for Diablo Compagnon
// @copyright     https://github.com/Azadrim
// @license       GPL-3.0 License
// @version       0.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[D4Builds]%20JsonExporterForDiablo4Companion.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[D4Builds]%20JsonExporterForDiablo4Companion.user.js

// @run-at        document-end
// @match         https://d4builds.gg/builds/*/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=d4builds.gg
// @grant         GM_registerMenuCommand
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    GM_registerMenuCommand(
        'DL Json for Diablo Compagnon',
        function () {
            function getAllAffixes(category) {
                var res = [];
                document.querySelectorAll(`:scope .${category} .filled`).forEach((e) => res.push(e.innerText));
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

            var result = {};
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
})();
