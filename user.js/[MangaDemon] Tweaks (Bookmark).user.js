// ==UserScript==
// @name          [MangaDemon] Tweaks (Bookmark)
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Sort Bookmarks
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[MangaDemon]%20Tweaks%20(Bookmark).user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[MangaDemon]%20Tweaks%20(Bookmark).user.js

// @match         https://demoncomics.org/following.php
// @icon          https://www.google.com/s2/favicons?sz=64&domain=demoncomics.org
// @grant         none
// @run-at        document-end
// ==/UserScript==

(function() {
    'use strict';

    function sortFunc(a, b){
        var aCard = a.querySelectorAll('.chapternumber'),
            bCard = b.querySelectorAll('.chapternumber');

        var aVal = Number(aCard[1].innerText.replace('Last Chapter ','')) - Number(aCard[0].innerText.replace('Last Chapter Read ','')),
            bVal = Number(bCard[1].innerText.replace('Last Chapter ','')) - Number(bCard[0].innerText.replace('Last Chapter Read ',''));

        if (aVal > bVal) {
            return -1;
        } else if (aVal === bVal) {
            return 0;
        } else {
            return 1;
        }
    }

    function sortList() {
        var elUl = document.querySelector(':scope .latestupdates ul');

        Array.from(elUl.getElementsByTagName("li"))
            .sort((a, b) => sortFunc(a,b))
            .forEach(elLi => elUl.appendChild(elLi));
    }

    window.addEventListener('load', function () {
        sortList();
    });
})();
