// ==UserScript==
// @name          [Google] Search Ad Remover
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Remove Adds on top of Google search
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.2

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Google]%20Search%20Ad%20Remover.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Google]%20Search%20Ad%20Remover.user.js

// @match         *://www.google.tld/search?*
// @icon          https://www.google.com/s2/favicons?domain=google.com
// @run-at        document-end
// ==/UserScript==

'use strict';

// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var removeAdd = true;

// **************************************************
// **********         S C R I P T          **********
// **************************************************
if (removeAdd) {
    document.querySelectorAll('#taw').forEach((ad) => ad.remove());
} else {
    document.querySelectorAll('#taw').forEach((ad) => {
        ad.style.display = 'none';
    });
}
