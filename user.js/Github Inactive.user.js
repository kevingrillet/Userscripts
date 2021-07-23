// ==UserScript==
// @name          Github inactive
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Add banner to innactive github
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.3

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/Github%20Inactive.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/Github%20Inactive.user.js

// @match         *://github.com/*/*
// @icon          https://www.google.com/s2/favicons?domain=github.com
// @run-at        document-end
// ==/UserScript==


// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var days = 365 / 2,
    bLightMode = true;


// **************************************************
// **********         S C R I P T          **********
// **************************************************
function addDiv(){
    let elDiv = document.createElement('div');
    if (bLightMode) {
        // could use flash-warn instead, but less flashy.
        elDiv.classList.add('flash', 'flash-error', 'flash-full', 'border-top-0', 'text-center', 'text-bold', 'py-2');
        elDiv.innerHTML = 'WARNING: This repo is pretty old ;)';
    } else {
        elDiv.setAttribute('style', 'display: flex; height: 50px; width: 100%; background-color: tomato; color: white; font-size: 2rem; font-family: consolas; text-align: center;');
        elDiv.innerHTML = '<p style="width: 100%">WARNING: This repo is pretty old ;) </p>';
    }
    document.querySelector('#js-repo-pjax-container').prepend(elDiv);
}

window.addEventListener('load', function () {
    let myInterval = setInterval(function () {
        if (document.querySelector('relative-time')) {
            if (Date.now() - new Date(document.querySelector('relative-time').date) > (days * 1000 * 60 * 60 * 24)) {
                addDiv();
            }
            clearInterval(myInterval);
            myInterval = null;
        }
    }, .5 * 1000);
});
