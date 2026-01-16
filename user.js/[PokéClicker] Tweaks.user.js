// ==UserScript==
// @name          [PokéClicker] Tweaks
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Less animations, achievement tracker sound notification
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           pokeclicker.com
// @version       0.4.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[PokéClicker]%20Tweaks.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[PokéClicker]%20Tweaks.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?sz=64&domain=pokeclicker.com
// @grant         GM_addStyle
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    // Less animations
    GM_addStyle(`
        .animated-currency {
            display: none;
        }
        .text-danger {
            display: inline !important;
        }
    `);

    // Notification
    const elAchievementTrackerProgressBar = document.querySelector('#achivementTrackerContainer .progress-bar');
    if (!elAchievementTrackerProgressBar) {
        console.warn('[PokéClicker] Tweaks: Achievement tracker progress bar not found');
        return;
    }

    const elPlayer = document.createElement('audio');
    elPlayer.src = 'https://raw.githubusercontent.com/kevingrillet/Userscripts/main/assets/my-work-is-done.mp3';

    const onMutate = (mutationsList) => {
        mutationsList.forEach(() => {
            const progress = Math.trunc(elAchievementTrackerProgressBar.style.width.slice(0, -1));
            //console.log(`Achievement Tracker progress: ${progress}`);
            if (progress === 100) {
                //console.log(`Achievement Tracker progress: ${progress} DING!`);
                elPlayer.play();
            }
        });
    };

    const observer = new MutationObserver(onMutate);
    observer.observe(elAchievementTrackerProgressBar, { attributes: true });
    // observer.disconnect();
})();
