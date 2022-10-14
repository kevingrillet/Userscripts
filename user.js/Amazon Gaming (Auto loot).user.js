// ==UserScript==
// @name          Amazon Gaming (Auto loot)
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Auto loot free games.
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/Amazon%20Gaming%20(Auto%20loot).user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/Amazon%20Gaming%20(Auto%20loot).user.js

// @match         https://gaming.amazon.com/home
// @icon          https://www.google.com/s2/favicons?domain=twitch.tv
// @run-at        document-end
// ==/UserScript==

"use strict";

window.addEventListener('load', function () {
    //document.querySelector(':scope div[data-a-target="offer-list-Game"] span[class="tw-button__text"]').scrollIntoView();
    //document.querySelector(':scope div[data-a-target="offer-list-Game"] span[class="tw-button__text"]').click();
    document.querySelectorAll(':scope div[data-a-target="offer-list-Game"] span[class="tw-button__text"]').forEach((e) => { e.click() });
})
