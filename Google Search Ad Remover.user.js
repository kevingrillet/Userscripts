// ==UserScript==
// @name          Google Search Ad Remover
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Remove Adds on top of Google search
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://github.com/kevingrillet/Userscripts/raw/main/Google%20Search%20Ad%20Remover.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Google%20Search%20Ad%20Remover.user.js

// @match         *://www.google.tld/search?*
// @run-at        document-end
// ==/UserScript==

//document.querySelectorAll('#taw').forEach((ad)=>{ad.style.display = "none"});
document.querySelectorAll('#taw').forEach((ad)=>{ad.remove()});
