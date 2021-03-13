// ==UserScript==
// @name          PSTHC Trophies Settings
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   PSTHC Trophies Settings
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://github.com/kevingrillet/Userscripts/raw/main/PSTHC%20Trophies%20Settings.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/PSTHC%20Trophies%20Settings.user.js

// @match         *://www.psthc.fr/unjeu/*/guide-trophees.htm
// @match         *://www.psthc.fr/unjeu/*/liste-trophees.htm
// @run-at        document-end
// ==/UserScript==


// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var tcOption = 1,
    toOption = 2,
    oOption = 0;


// **************************************************
// **********      V A R I A B L E S       **********
// **************************************************
var CST_tcOptions = ["Afficher", "Masquer"],
    CST_toOptions = ["Tout afficher", "Afficher mes trophées obtenus", "Afficher mes trophées manquants"],
    CST_oOptions = ["Tri Console", "Tri Rang", "Tri Alphabétique", "Tri Date d'obtention", "Tri Pourcentage d'obtention"];


// **************************************************
// **********         S C R I P T          **********
// **************************************************
function doTropheeCaches() {
    var tc = document.querySelector(':scope #filter5 .dropdown-menu');
    tc.querySelectorAll('.dropdown-item').forEach(e => {
        if (e.text == CST_tcOptions[tcOption || 0]) e.click();
    });
}

function doTropheeObtenus() {
    var to = document.querySelector(':scope #filter6 .dropdown-menu');
    to.querySelectorAll('.dropdown-item').forEach(e => {
        if (e.text == CST_toOptions[toOption || 0]) e.click();
    });
}

function doOrdre() {
    var o = document.querySelector(':scope #filter3 .dropdown-menu');
    o.querySelectorAll('.dropdown-item').forEach(e => {
        if (e.text == CST_oOptions[oOption || 0]) e.click();
    });
}


// **************************************************
// **********       L I S T E N E R        **********
// **************************************************
window.addEventListener('load', function () {
    if (tcOption != 0) doTropheeCaches();
    if (toOption != 0) doTropheeObtenus();
    if (oOption != 0) doOrdre();
});
