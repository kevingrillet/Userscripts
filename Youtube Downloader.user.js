// ==UserScript==
// @name          Youtube Downloader
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Add link to Yout.com
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://github.com/kevingrillet/Userscripts/raw/main/Youtube%20Downloader.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Youtube%20Downloader.user.js

// @match         https://www.youtube.com/*
// @require       https://use.fontawesome.com/releases/v5.15.2/js/all.js
// @run-at        document-end
// ==/UserScript==

var CST_ID_METACONTENT = '#meta-contents #subscribe-button ytd-subscribe-button-renderer';

// Menu
function addStyles(css) {
    var style = document.head.appendChild(document.createElement('style'));
    style.type = 'text/css';
    style.innerHTML = css;
}

addStyles(`
#my_dl { cursor: pointer; float: right; }
#my_dl span { font-size: 3em; color: GhostWhite; }
`);

var elDiv = document.createElement('div');
elDiv.id = 'my_dl';
elDiv.innerHTML = `
  <span class="dl" title="Download">
    <a><i class="fas fa-fw fa-file-download" ></i></a>
  </span>
`;

function launchDl(){
    if (window.location.href.match(/.*\.youtube.com\/watch\?.*v=[^#\&\?]*/)) {
        window.open(window.location.href.replace('youtube.com', 'yout.com'), "_blank");
    }
}

window.addEventListener('load', function () {
    var myInterval = setInterval(function() {
        if (document.querySelector(`:scope ${CST_ID_METACONTENT}`)) {
            document.querySelector(`:scope ${CST_ID_METACONTENT}`).append(elDiv);
            document.querySelector('.dl').onclick = function() { launchDl(); };
            clearInterval(myInterval);
            myInterval = null;
        }
    }, .5 * 1000);
});
