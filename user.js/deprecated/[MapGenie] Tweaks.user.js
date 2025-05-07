// ==UserScript==
// @name          [MapGenie] Tweaks
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Tweak MapGenie
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           mapgenie
// @tag           deprecated
// @version       1.5

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/deprecated/[MapGenie]%20Tweaks.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/deprecated/[MapGenie]%20Tweaks.user.js

// @match         https://mapgenie.io/*/maps/world
// @icon          https://www.google.com/s2/favicons?sz=64&domain=mapgenie.io
// @grant         none
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    window.addEventListener('load', function () {
        if (document.querySelector('#blobby-left') !== 'undefined') {
            document.querySelector('#blobby-left').style.display = 'none';
        }
        if (document.querySelector('#onetrust-reject-all-handler') !== 'undefined') {
            document.querySelector('#onetrust-reject-all-handler').click();
        }
        //document.querySelector(':scope #right-sidebar .right-arrow').click()
    });
})();
