// ==UserScript==
// @name          Prusa Mini Connect
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Replace name of the page with status.
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.23

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/Prusa%20Mini%20Connect.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/Prusa%20Mini%20Connect.user.js

// @match         http://192.168.1.59/
// @icon          https://www.google.com/s2/favicons?sz=64&domain=https://www.prusa3d.com/fr/
// @run-at        document-idle
// ==/UserScript==

(function() {
    'use strict';

    const aStatusPrinting = ['Impression'],
          aStatusIdle = ['Repos'];

    var
        bPrinting = false,
        refreshSpeed = 60,
        elBedTemp = document.querySelector('.title.is-size-2.is-size-5-desktop.has-text-white'),
        elDateEnd = document.querySelectorAll('.columns.is-desktop.is-centered')[3].querySelectorAll('.title.is-size-2.is-size-5-desktop.has-text-white')[3],
        elPercent = document.querySelectorAll('.columns.is-desktop.is-centered')[3].querySelector('.title.has-text-centered.is-size-1.is-size-3-desktop'),
        elStatus = document.querySelector('.title.is-size-3.is-size-4-desktop span'),
        elPlayer = document.createElement('audio');
    elPlayer.src = 'https://raw.githubusercontent.com/kevingrillet/Userscripts/main/assets/file_s_done.mp3';

    function refreshTitle(){
        if (aStatusPrinting.includes(elStatus.innerText.trim())){
            document.title = elPercent.innerText + " - " + elDateEnd.innerText;
            refreshSpeed = 60;
            bPrinting = true;
        } else if ( aStatusIdle.includes(elStatus.innerText.trim())
                   && (elBedTemp.innerText.includes('°C') ? parseInt(elBedTemp.innerText.slice(0, -3)) > 30 : false)) {
            document.title = (document.title == '🔥 Prusa - Waiting temp' ? '\u200E' : '🔥 Prusa - Waiting temp');
            refreshSpeed = 1;
            if (bPrinting == true){
                bPrinting = false;
                elPlayer.play();
            }
        } else {
            document.title = '💤 Prusa - Idle';
            refreshSpeed = 60;
        }
    }

    refreshTitle();
    setInterval(function () {
        refreshTitle();
    }, refreshSpeed * 1000);

})();