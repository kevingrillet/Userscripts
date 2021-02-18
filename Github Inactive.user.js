// ==UserScript==
// @name          Github inactive
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Add banner to innactive github
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://github.com/kevingrillet/Userscripts/raw/main/Github%20Inactive.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Github%20Inactive.user.js

// @match         *://github.com/*/*
// @run-at        document-end
// ==/UserScript==

// Can be edited
var days = 365/2;

// Script
if (Date.now() - new Date(document.querySelector('relative-time').date) > (days * 1000 * 60 * 60 * 24)) {
    var elDiv = document.createElement("div"); 
    elDiv.setAttribute('style','display: flex; height: 50px; width: 100%; background-color: tomato; color: white; font-size: 2rem; font-family: consolas;');
    elDiv.innerHTML = 'WARNING: This repo is prety old ;) ';
    document.querySelector('#js-repo-pjax-container').prepend(elDiv);
}
