// ==UserScript==
// @name          [GitHub] inactive
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Add banner to innactive github
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           github.com
// @version       1.5

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[GitHub]%20Inactive.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[GitHub]%20Inactive.user.js

// @match         https://github.com/*/*
// @icon          https://www.google.com/s2/favicons?domain=github.com
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    const DAYS = 365 / 2;
    const LIGHT_MODE = true;
    const WARNING_MESSAGE = '⚠️ WARNING: This repo is pretty old ⚠️';

    function addDiv() {
        const template = LIGHT_MODE
            ? `<div class="flash flash-error flash-full border-top-0 text-center text-bold py-2">
                 ${WARNING_MESSAGE}
               </div>`
            : `<div style="display: flex; height: 50px; width: 100%; background-color: tomato; color: white; font-size: 2rem; font-family: consolas; text-align: center;">
                 <p style="width: 100%">${WARNING_MESSAGE}</p>
               </div>`;
        document.querySelector('#js-repo-pjax-container').insertAdjacentHTML('afterbegin', template);
    }

    window.addEventListener('load', function () {
        const MAX_ATTEMPTS = 10;
        let attempts = 0;
        let myInterval = setInterval(function () {
            attempts++;
            if (document.querySelector('relative-time')) {
                if (Date.now() - new Date(document.querySelector('relative-time').date) > DAYS * 1000 * 60 * 60 * 24) {
                    addDiv();
                }
                clearInterval(myInterval);
            } else if (attempts >= MAX_ATTEMPTS) {
                clearInterval(myInterval);
                console.warn('[GitHub] Inactive: Failed to find relative-time element');
            }
        }, 1000);
    });
})();
