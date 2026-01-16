// ==UserScript==
// @name          [Google] Search Ad Remover
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Remove Adds on top of Google search
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           google.com
// @version       1.2.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Google]%20Search%20Ad%20Remover.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Google]%20Search%20Ad%20Remover.user.js

// @match         https://www.google.tld/search?*
// @icon          https://www.google.com/s2/favicons?domain=google.com
// @grant         GM_registerMenuCommand
// @grant         GM_setValue
// @grant         GM_getValue
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    const removeAdd = GM_getValue('removeAdd', true);

    function toggleRemoveAdd() {
        const newValue = !GM_getValue('removeAdd', true);
        GM_setValue('removeAdd', newValue);
        location.reload();
    }

    GM_registerMenuCommand(removeAdd ? '✅ Toogle remove Ads' : '❌ Toogle remove Ads', toggleRemoveAdd);

    if (removeAdd) {
        document.querySelectorAll('#taw').forEach((ad) => ad.remove());
    } else {
        document.querySelectorAll('#taw').forEach((ad) => {
            ad.style.display = 'none';
        });
    }
})();
