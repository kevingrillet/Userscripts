// ==UserScript==
// @name          Youtube Downloader
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Add link to Yout.com
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://github.com/kevingrillet/Userscripts/raw/main/Youtube%20Downloader.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Youtube%20Downloader.user.js

// @match         https://www.youtube.com/*
// @require       https://use.fontawesome.com/releases/v5.15.2/js/all.js
// @run-at        document-end
// ==/UserScript==

var CST_ID_SUBSCRIBE = '#subscribe-button';

// Menu
function addStyles(css) {
    var style = head.appendChild(document.createElement('style'));
    style.type = 'text/css';
    style.innerHTML = css;
}

addStyles(`
#my_dl { cursor: pointer; float: right; }
#my_dl span { font-size: 1em; color: GhostWhite; }
`);

var elDiv = document.querySelector(CST_ID_SUBSCRIBE).appendChild(document.createElement('div'));
elDiv.id = 'my_dl';
elDiv.innerHTML = `
  <span class="dl" title="Download">
    <a><i class="fas fa-fw fa-file-download" ></i></a>
  </span>
`;

document.querySelector('.export').onclick = function() { launchDl(); };

function launchDl(){
    if (window.location.href.match(/.*\.youtube.com\/watch\?.*v=[^#\&\?]*/)) {
        window.open(window.location.href.replace('youtube.com', 'yout.com'), "_blank");
    }    
}
