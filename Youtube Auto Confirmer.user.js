// ==UserScript==
// @name          Youtube Auto confirmer
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Automatically clicks 'Ok' when the 'Video paused. Continue watching?' dialog pops up and pauses your videos.
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://github.com/kevingrillet/Userscripts/raw/main/Youtube%20Auto%20Confirmer.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Youtube%20Auto%20Confirmer.user.js

// @match         https://www.youtube.com/*
// @run-at        document-end
// ==/UserScript==


// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var msg = ["Video paused. Continue watching?","Vidéo mise en pause. Poursuivre la lecture ?"];


// **************************************************
// **********         S C R I P T          **********
// **************************************************
setInterval(function() {
    'use strict';
    var el = document.querySelectorAll('.line-text.style-scope.yt-confirm-dialog-renderer')
    if (el.length >= 1) {
        for (let i = 0; i < el.length; i++) {
            for (let j = 0; j < msg.length; j++){
                if (el[i].innerText == msg[j]) {
                    el[i].parentNode.parentNode.parentNode.querySelector('#confirm-button').click()
                }
            }
        }
    }
}, 1 * 1000)();
