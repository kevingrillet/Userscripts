// ==UserScript==
// @name          Google Search Ad Remover
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Remove Adds on top of Google search
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Google%20Search%20Ad%20Remover.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Google%20Search%20Ad%20Remover.user.js

// @match         *://www.google.tld/search?*
// @run-at        document-end
// ==/UserScript==


// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var removeAdd = true;


// **************************************************
// **********         S C R I P T          **********
// **************************************************
if (removeAdd) {
    document.querySelectorAll('#taw').forEach(ad => ad.remove());
} else {
    document.querySelectorAll('#taw').forEach(ad => { ad.style.display = "none" });
}
