// ==UserScript==
// @name          Google Incognito
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Add banner to innactive github
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

document.querySelectorAll('a').forEach(el => {
    if (el.href.test('.*docs\.google\.com.*')) {
        el.onclick = `javascript:chrome.windows.create({"url": ${el.href}, "incognito": true}); return false;`;
    }
});
