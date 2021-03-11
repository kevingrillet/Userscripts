// ==UserScript==
// @name          OP.gg (Update)
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Auto-Update profile
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://github.com/kevingrillet/Userscripts/raw/main/OP.gg%20(Update).user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/OP.gg%20(Update).user.js

// @match         *://euw.op.gg/summoner/userName=*
// @run-at        document-end
// ==/UserScript==


// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var minutes = 10, // number of minutes before auto refresh
    cleanUI = true; // remove crap


// **************************************************
// **********             U I              **********
// **************************************************
function removeCrap() {
    document.querySelectorAll('.image-banner').forEach(e => e.style.display = "none");
    document.querySelectorAll('.vm-placement').forEach(e => e.style.display = "none");
    document.querySelectorAll('.life-owner').forEach(e => e.style.display = "none");
    document.querySelectorAll('.vm-skin').forEach(e => e.style.display = "none");
}


// **************************************************
// **********       L I S T E N E R        **********
// **************************************************
window.addEventListener('load', function () {
    if (cleanUI) removeCrap();

    if ((new Date() - new Date(document.querySelector('._timeago').title)) / (1000 * 60) >= minutes) {
        document.querySelector('#SummonerRefreshButton').click();
    }
});
