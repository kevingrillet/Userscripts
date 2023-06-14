// ==UserScript==
// @name          Youtube Auto confirmer
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Automatically clicks 'Ok' when the 'Video paused. Continue watching?' dialog pops up and pauses your videos.
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.3

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/deprecated/Youtube%20Auto%20Confirmer.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/deprecated/Youtube%20Auto%20Confirmer.user.js

// @match         https://www.youtube.com/*
// @icon          https://www.google.com/s2/favicons?domain=youtube.com
// @run-at        document-end
// ==/UserScript==

'use strict';

// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var msgs = ['Video paused. Continue watching?', 'Vidéo mise en pause. Poursuivre la lecture?'];

// **************************************************
// **********         S C R I P T          **********
// **************************************************
setInterval(function () {
    'use strict';
    let els = document.querySelectorAll('.line-text.style-scope.yt-confirm-dialog-renderer') || [];
    for (let el of els) {
        for (let msg of msgs) {
            if (el.innerText === msg) {
                el.parentNode.parentNode.parentNode.querySelector('#confirm-button').click();
            }
        }
    }
}, 1 * 1000)();
