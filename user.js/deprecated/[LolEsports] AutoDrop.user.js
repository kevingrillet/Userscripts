// ==UserScript==
// @name          [LolEsports] AutoDrop
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Auto loot drops
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.2

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[LolEsports]%20AutoDrop.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[LolEsports]%20AutoDrop.user.js

// @match         https://lolesports.com/live/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=lolesports.com/
// @grant         none
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    var closeRewardDrop = function () {
        setTimeout(function () {
            if (document.querySelector('.RewardsDropsOverlay .close')) {
                console.log('%c Drop overlay closed! ', 'background: GhostWhite; color: DarkRed');
                document.querySelector('.RewardsDropsOverlay .close').click();
                lookForDrop();
            } else {
                closeRewardDrop();
            }
        }, 0.5 * 1000);
    };

    var lookForDrop = function () {
        setTimeout(function () {
            if (document.querySelector('.InformNotifications .drops-fulfilled')) {
                console.log('%c Drop collected! ', 'background: GhostWhite; color: DarkGreen');
                document.querySelector('.InformNotifications .drops-fulfilled .text').click();
                closeRewardDrop();
            } else {
                lookForDrop();
            }
        }, 10 * 1000);
    };

    lookForDrop();
})();
