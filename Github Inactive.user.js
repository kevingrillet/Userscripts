// ==UserScript==
// @name          Github inactive
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Add banner to innactive github
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.2

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://github.com/kevingrillet/Userscripts/raw/main/Github%20Inactive.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Github%20Inactive.user.js

// @match         *://github.com/*/*
// @run-at        document-end
// ==/UserScript==


// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var days = 365/2;


// **************************************************
// **********         S C R I P T          **********
// **************************************************
window.addEventListener('load', function () {
    var myInterval = setInterval(function() {
        if (document.querySelector('relative-time')) {
            if (Date.now() - new Date(document.querySelector('relative-time').date) > (days * 1000 * 60 * 60 * 24)) {
                var elDiv = document.createElement("div");
                elDiv.setAttribute('style','display: flex; height: 50px; width: 100%; background-color: tomato; color: white; font-size: 2rem; font-family: consolas; text-align: center;');
                elDiv.innerHTML = '<p style="width: 100%">WARNING: This repo is pretty old ;) </p>';
                document.querySelector('#js-repo-pjax-container').prepend(elDiv);
            }
            clearInterval(myInterval);
            myInterval = null;
        }
    }, .5 * 1000);
});
