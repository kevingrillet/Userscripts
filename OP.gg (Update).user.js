// ==UserScript==
// @name          OP.gg (Update)
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Auto-Update profile
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/OP.gg%20(Update).user.js
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
    document.querySelectorAll('.image-banner').forEach(e => { e.style.display = "none" });
    document.querySelectorAll('.vm-placement').forEach(e => { e.style.display = "none" });
    document.querySelectorAll('.life-owner').forEach(e => { e.style.display = "none" });
    document.querySelectorAll('.vm-skin').forEach(e => { e.style.display = "none" });
}


// **************************************************
// **********       O B S E R V E R        **********
// **************************************************
// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
function openAll(){
    document.querySelectorAll(':scope .SpectateSummoner .SummonerName a').forEach(s => {
        if (s.innerHTML != document.querySelector('.Name').innerHTML) s.click()
    });
}

function addButtonOpenAll() {
    let el = document.querySelector('.SpectatorButtons').appendChild(document.createElement('button'));
    el.classList.add('Button', 'SemiRound', 'RealWhite');
    el.innerHTML = `
        <i class="__spSite __spSite-157"></i>
        Open all players profile
    `;
    el.onclick = function () { openAll(); };
}

// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for(const mutation of mutationsList) {
        for(const node of mutation.addedNodes) {
            if (node.classList && node.classList.contains('SpectatorButtons')) addButtonOpenAll();
        }
    }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);
// Start observing the target node for configured mutations
observer.observe(document.querySelector('.summonerLayout-spectator'), { attributes: true, childList: true, subtree: true });


// **************************************************
// **********       L I S T E N E R        **********
// **************************************************
window.addEventListener('load', function () {
    let cnt = 0;
    if (cleanUI) {
        let myInterval = setInterval(function () {
            removeCrap();
            if (++cnt > 10) {
                clearInterval(myInterval);
                myInterval = null;
            }
        }, .5 * 1000);
    }

    if ((new Date() - new Date(document.querySelector('._timeago').title)) / (1000 * 60) >= minutes) {
        document.querySelector('#SummonerRefreshButton').click();
    }
});
