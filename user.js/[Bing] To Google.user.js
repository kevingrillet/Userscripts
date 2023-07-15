// ==UserScript==
// @name          [Bing] to Google
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Redirect the search to google
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.3

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Bing]%20To%20Google.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Bing]%20To%20Google.user.js

// @match         *://*.bing.com/search?*
// @icon          https://www.google.com/s2/favicons?domain=bing.fr
// @grant         GM_getValue
// @grant         GM_setValue
// @run-at        document-start
// ==/UserScript==

'use strict';

// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var doReward = false; //Launch 30 consecutives searches for easy 90Points / day

// **************************************************
// **********         S C R I P T          **********
// **************************************************
if (doReward && GM_getValue('dayDone', null) !== new Date().getDay()) {
    GM_setValue('dayDone', new Date().getDay());
    GM_setValue('search', 0);
    GM_setValue('toSearch', document.URL.match(/q=[^&]*/));
}

if (!doReward || GM_getValue('search', 31) > 30) {
    window.location.assign(`https://google.com/search?${document.URL.match(/q=[^&]*/)}`);
} else {
    if (GM_getValue('search') === 30) {
        window.location.assign(`https://www.bing.com/search?${GM_getValue('toSearch')}`);
    } else {
        window.location.assign(`https://www.bing.com/search?q=Reward${GM_getValue('search')}`);
    }
    GM_setValue('search', GM_getValue('search') + 1);
}
