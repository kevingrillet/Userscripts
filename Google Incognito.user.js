// ==UserScript==
// @name          Google Incognito
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Open google docs incognito
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://github.com/kevingrillet/Userscripts/raw/main/Google%20Incognito.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Google%20Incognito.user.js

// @match         *
// @run-at        document-end
// ==/UserScript==

// **************************************************
// **********       L I S T E N E R        **********
// **************************************************
window.addEventListener('load', function () {
    document.querySelectorAll('a').forEach(el => {
        if (el.href.match('.*docs\.google\.com.*') != null) {
            el.setAttribute('onclick', `javascript:windows.create({"url": ${el.href}, "incognito": true});`);
        }
    });
});
