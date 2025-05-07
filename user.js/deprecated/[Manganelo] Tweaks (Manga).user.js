// ==UserScript==
// @name          [Manganelo] Tweaks (Manga)
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Try to work with gm_values to refresh specific manga
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           manganelo.com
// @tag           deprecated
// @version       0.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/deprecated/[Manganelo]%20Tweaks%20(Manga).user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/deprecated/[Manganelo]%20Tweaks%20(Manga).user.js

// @match         *://manganelo.com/manga*
// @icon          https://www.google.com/s2/favicons?domain=manganelo.com
// @grant         GM_getValue
// @grant         GM_info
// @grant         GM_setValue
// @require       https://use.fontawesome.com/releases/v5.15.2/js/all.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.4/FileSaver.min.js
// @run-at        document-end
// ==/UserScript==

'use strict';

// Can't work :(
// gm_values are like cookies for specific script, so you can't access them with another script...
// could be possible with unsafeWindow.myFunction(); with a third script with data storage... but meh

// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var // moveContainerRight = true, // Move MOST POPULAR MANGA & MANGA BY GENRES to bottom
    // moveContinerTop = true, // Move top to bottom, need right to be active
    forceRefresh = false, // IDK if we can be ban for this, it will ask so many requests...
    env = [
        {
            name: 'Manganelo', // Name
            match: '^.*://manganelo.com/manga.*', // Match needed to know we are here
            chapter_url: 'chapter_', // to remove chapter from link to do proper count
            class_adult: 'panel-story-info', // class location of adult tag
            class_btn: 'panel-breadcrumb', // class to add icon
            class_hype: 'info-image', // class location of hype tag
            tag_rank: '[property="v:average"]', // tag of rank
        },
    ];

// **************************************************
// **********      V A R I A B L E S       **********
// **************************************************
var CST_APP_VERSION = GM_getValue('app_version', GM_info.script.version),
    // CST_CHAPTER_URL = null,
    CST_CLASS_ADULT = null,
    CST_CLASS_BTN = null,
    CST_CLASS_HYPE = null,
    CST_TAG_RANK = null;

env.some(function (e) {
    if (e.match && new RegExp(e.match, 'i').test(window.location.href)) {
        // CST_CHAPTER_URL = e.chapter_url;
        CST_CLASS_ADULT = '.' + e.class_adult.replace(' ', '.');
        CST_CLASS_BTN = '.' + e.class_btn.replace(' ', '.');
        CST_CLASS_HYPE = '.' + e.class_hype.replace(' ', '.');
        CST_TAG_RANK = e.tag_rank;
    }
});

// **************************************************
// **********        S T O R A G E         **********
// **************************************************
function refreshData() {
    let tag = document.querySelectorAll(CST_CLASS_BTN + ' a')[1].href.split('/')[4],
        value = GM_getValue(tag, null),
        local_value = {
            version: CST_APP_VERSION,
            date: new Date(),
            adult: (document.querySelector(CST_CLASS_ADULT).innerHTML.match(/Adult/gm) || []).length,
            hype: document.querySelector(`:scope ${CST_CLASS_HYPE} em`) ? document.querySelector(`:scope ${CST_CLASS_HYPE} em`).classList[0] : null,
            rank: document.querySelector(`em${CST_TAG_RANK}`).textContent,
        };

    if (forceRefresh || !(value && value.adult === local_value.adult && value.hype === local_value.hype && value.rank === local_value.rank)) {
        GM_setValue(tag, local_value);

        console.debug(`Value updated for ${document.querySelectorAll(CST_CLASS_BTN + ' a')[1].text}`);
        console.debug(local_value);
    }
}

refreshData();
