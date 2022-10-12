// ==UserScript==
// @name          [Pokeclicker] Tweaks
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Less animations, achievement tracker sound notification
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Pokeclicker]%20Tweaks.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Pokeclicker]%20Tweaks.user.js

// @match         https://www.pokeclicker.com/
// @icon          https://www.google.com/s2/favicons?sz=64&domain=pokeclicker.com
// @grant         GM_addStyle
// @run-at        document-end
// ==/UserScript==

(function() {
    'use strict';

    // Less animations
    GM_addStyle(".animated-currency { display: none; }");
    GM_addStyle(".text-danger { display: inline !important; }");


    // Nofication
    var observer,
        elAchievementTrackerProgressBar = document.querySelector("#achivementTrackerContainer .progress-bar"),
        elPlayer = document.createElement('audio');
    elPlayer.src = 'https://notificationsounds.com/storage/sounds/file-sounds-1229-my-work-is-done.mp3';

    var onMutate = function(mutationsList) {
        mutationsList.forEach(mutation => {
            //console.log("Achievement Tracker progress: " + Math.trunc(elAchievementTrackerProgressBar.style.width.slice(0, -1)));
            if (Math.trunc(elAchievementTrackerProgressBar.style.width.slice(0, -1)) == 100){
                //console.log("Achievement Tracker progress: " + Math.trunc(elAchievementTrackerProgressBar.style.width.slice(0, -1)) + " DING!");
                elPlayer.play();
            }
        })
    };
    observer = new MutationObserver(onMutate);
    observer.observe(elAchievementTrackerProgressBar, {attributes: true});
    // observer.disconnect();
})();