// ==UserScript==
// @name          [Bing] To Google
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Redirect the search to google
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           bing.com
// @version       1.4.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Bing]%20To%20Google.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Bing]%20To%20Google.user.js

// @match         https://www.bing.com/search?*
// @icon          https://www.google.com/s2/favicons?domain=bing.com
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_registerMenuCommand
// @run-at        document-start
// ==/UserScript==

(function () {
    'use strict';

    var doReward = GM_getValue('doReward', false); //Launch 30 consecutives searches for easy 90Points / day
    var debugWord = GM_getValue('debugWord', 'debug'); //Word to stay on Bing

    // Register Tampermonkey menu commands
    GM_registerMenuCommand('Toggle Reward Mode', function () {
        doReward = !doReward;
        GM_setValue('doReward', doReward);
        alert('Reward Mode is now ' + (doReward ? 'enabled' : 'disabled'));
    });

    GM_registerMenuCommand('Change Debug Word', function () {
        const newWord = prompt('Enter new debug word:', debugWord);
        if (newWord !== null && newWord.trim() !== '') {
            debugWord = newWord.trim();
            GM_setValue('debugWord', debugWord);
            alert('Debug word changed to: ' + debugWord);
        }
    });

    // Check if search contains debug word
    const searchQuery = document.URL.match(/q=([^&]*)/);
    if (searchQuery && decodeURIComponent(searchQuery[1]) === debugWord) {
        return; // Stay on Bing if debug word is used
    }

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
})();
