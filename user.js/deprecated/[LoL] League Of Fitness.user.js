// ==UserScript==
// @name          [LoL] League Of Fitness
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   https://www.reddit.com/r/leagueoflegends/comments/1li068/league_of_fitness/
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           leagueoflegends.com
// @tag           deprecated
// @version       1.2

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/deprecated/[LoL]%20League%20Of%20Fitness.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/deprecated/[LoL]%20League%20Of%20Fitness.user.js

// @match         *://matchhistory.euw.leagueoflegends.com/*/*
// @icon          https://www.google.com/s2/favicons?domain=leagueoflegends.com
// @run-at        document-end
// ==/UserScript==

'use strict';

// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
// KI, DE, AS, VI, DEF, TU, IN,  BA,  DR, RI, ETU, EIN, EBA, EDR, ERI
var pu = [0.5, 1, 0, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1.5, 5], // Push ups
    su = [0, 0, 1, 6, 10, 0, 0, 0, 0, 0, 0, 2, 4.5, 0, 0], // Sit Ups
    s = [0, 0, 0, 12, 16, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0]; // Squats

// **************************************************
// **********      V A R I A B L E S       **********
// **************************************************
const KILL = 0,
    DEATH = 1,
    ASSIST = 2,
    VICTORY = 3,
    DEFEAT = 4,
    TURRET = 5,
    INHIBITOR = 6,
    BARON = 7,
    DRAGON = 8,
    RIFT = 9,
    ETURRET = 10,
    EINHIBITOR = 11,
    EBARON = 12,
    EDRAGON = 13,
    ERIFT = 14;

var fpu = 0,
    fsu = 0,
    fs = 0;

// **************************************************
// **********         S C R I P T          **********
// **************************************************
function fitness(doc) {
    fpu = 0;
    fsu = 0;
    fs = 0;
    // KI, DE, AS, VI, DEF, TU, IN, BA, DR, RI, ETU, EIN, EBA, EDR, ERI
    let data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        docCurrentUser = doc.querySelector('.current-user.player'),
        // KDA
        docKDA = docCurrentUser.querySelector('.kda-kda'),
        docK = docKDA.firstChild,
        docD = docK.nextElementSibling,
        docA = docD.nextElementSibling;

    data[KILL] = docK.innerHTML;
    data[DEATH] = docD.innerHTML;
    data[ASSIST] = docA.innerHTML;

    // GAME
    let docTeamHeader = docCurrentUser.parentNode.parentNode.parentNode.firstElementChild;

    let ga = docTeamHeader.firstElementChild.firstElementChild.querySelector('.game-conclusion').innerHTML;
    if (ga.match(/.*VICTORY.*/) || ga.match(/.*VICTOIRE.*/)) {
        data[VICTORY] = 1;
        data[DEFEAT] = 0;
    } else {
        data[VICTORY] = 0;
        data[DEFEAT] = 1;
    }

    // ALLY
    let docTeamFooter = docCurrentUser.parentNode.parentNode.nextElementSibling.firstElementChild.firstElementChild;

    data[TURRET] = docTeamFooter.querySelector(':scope .tower-kills span') ? docTeamFooter.querySelector(':scope .tower-kills span').innerHTML : 0;
    data[INHIBITOR] = docTeamFooter.querySelector(':scope .inhibitor-kills span') ? docTeamFooter.querySelector(':scope .inhibitor-kills span').innerHTML : 0;
    data[BARON] = docTeamFooter.querySelector(':scope .baron-kills span') ? docTeamFooter.querySelector(':scope .baron-kills span').innerHTML : 0;
    data[DRAGON] = docTeamFooter.querySelector(':scope .dragon-kills span') ? docTeamFooter.querySelector(':scope .dragon-kills span').innerHTML : 0;
    data[RIFT] = docTeamFooter.querySelector(':scope .rift-herald-kills span') ? docTeamFooter.querySelector(':scope .rift-herald-kills span').innerHTML : 0;

    // ENEMY
    let docTeam = docTeamHeader.parentNode.parentNode,
        docEnemy = docTeam.nextElementSibling;
    if (docEnemy === null) {
        docEnemy = docTeam.previousElementSibling;
    }
    let docEnemyFooter = docEnemy.firstElementChild.firstElementChild.nextElementSibling.nextElementSibling.firstElementChild.firstElementChild;

    data[ETURRET] = docEnemyFooter.querySelector(':scope .tower-kills span') ? docEnemyFooter.querySelector(':scope .tower-kills span').innerHTML : 0;
    data[EINHIBITOR] = docEnemyFooter.querySelector(':scope .inhibitor-kills span')
        ? docEnemyFooter.querySelector(':scope .inhibitor-kills span').innerHTML
        : 0;
    data[EBARON] = docEnemyFooter.querySelector(':scope .baron-kills span') ? docEnemyFooter.querySelector(':scope .baron-kills span').innerHTML : 0;
    data[EDRAGON] = docEnemyFooter.querySelector(':scope .dragon-kills span') ? docEnemyFooter.querySelector(':scope .dragon-kills span').innerHTML : 0;
    data[ERIFT] = docEnemyFooter.querySelector(':scope .rift-herald-kills span') ? docEnemyFooter.querySelector(':scope .rift-herald-kills span').innerHTML : 0;

    // MATHS
    for (let index = 0; index < data.length; index++) {
        fpu += pu[index] * data[index];
        fsu += su[index] * data[index];
        fs += s[index] * data[index];
    }

    let fit = [fpu, fsu, fs];

    let elDiv = document.querySelector('.game-header').appendChild(document.createElement('div'));
    elDiv.classList.add('content-border');
    elDiv.style = 'margin-top: 0; border-top: 0; padding-top: 0; width: 100%; font-family: consolas;';
    elDiv.innerHTML = `
  <div class="white-stone" style="display: flex; width: 100%;">
    <h4 style="flex: 1;">League Of Fitness</h4>
    <span id="pu" style="flex: 1;"></span>
    <span id="su" style="flex: 1;"></span>
    <span id="s" style="flex: 1;"></span>
  </span>
`;

    document.querySelector('#pu').innerHTML = 'Push-ups: ' + fit[0];
    document.querySelector('#su').innerHTML = 'Sit-ups: ' + fit[1];
    document.querySelector('#s').innerHTML = 'Squats: ' + fit[2];
}

var myInterval = setInterval(function () {
    if (document.querySelector('.scoreboard')) {
        fitness(document.body);
        clearInterval(myInterval);
        myInterval = null;
    }
}, 0.5 * 1000);
