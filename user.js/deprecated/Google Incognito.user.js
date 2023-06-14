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
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/Google%20Incognito.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/Google%20Incognito.user.js

// @match         *
// @icon          https://www.google.com/s2/favicons?domain=google.com
// @run-at        document-end
// ==/UserScript==

'use strict';

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/create
// Will not work :(

// **************************************************
// **********      V A R I A B L E S       **********
// **************************************************

/* global chrome */
var browser = chrome || null;

// **************************************************
// **********       L I S T E N E R        **********
// **************************************************
window.addEventListener('load', function () {
    document.querySelectorAll('a').forEach((el) => {
        if (el.href.match('.*docs.google.com.*') !== null) {
            el.setAttribute('onclick', `javascript:${browser}.windows.create({"url": ${el.href}, "incognito": true});`);
        }
    });
});
