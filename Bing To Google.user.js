// ==UserScript==
// @name          Bing to Google
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Redirect the search to google
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://github.com/kevingrillet/Userscripts/raw/main/Bing%20To%20Google.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Bing%20To%20Google.user.js

// @match         *://*.bing.com/search?*
// @run-at        document-end
// ==/UserScript==


// **************************************************
// **********         S C R I P T          **********
// **************************************************
window.location.assign("https://google.com/search?"+document.URL.match(/q\=[^&]*/));
