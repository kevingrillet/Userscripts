// ==UserScript==
// @name          [YouTube] Downloader
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Add link to Yout.com
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           youtube.com
// @tag           deprecated
// @version       1.5

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/deprecated/[YouTube]%20Downloader.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/deprecated/[YouTube]%20Downloader.user.js

// @match         https://www.youtube.com/*
// @icon          https://www.google.com/s2/favicons?domain=youtube.com
// @require       https://use.fontawesome.com/releases/v5.15.2/js/all.js
// @grant         none
// @run-at        document-end
// ==/UserScript==

'use strict';

// **************************************************
// **********      V A R I A B L E S       **********
// **************************************************
var CST_ID_METACONTENT = '#meta-contents #subscribe-button ytd-subscribe-button-renderer';

// **************************************************
// **********           M E N U            **********
// **************************************************
// require: https://use.fontawesome.com/releases/v5.15.2/js/all.js
function addStyles(css) {
    let style = document.head.appendChild(document.createElement('style'));
    style.type = 'text/css';
    style.innerHTML = css;
}

function addMenu() {
    addStyles(`
#my_dl { cursor: pointer; float: right; padding-top: 8px;}
#my_dl span { font-size: 2em; color: rgb(144, 144, 144); }
`);

    let elParent = document.querySelector(`:scope ${CST_ID_METACONTENT}`),
        elDiv = elParent.appendChild(document.createElement('div'));
    elDiv.id = 'my_dl';
    elDiv.innerHTML = `
  <span class="dl" title="Download">
    <a><i class="fas fa-fw fa-file-download" ></i></a>
  </span>
`;
    elDiv.onclick = function () {
        launchDl();
    };
}

// **************************************************
// **********       L I S T E N E R        **********
// **************************************************
window.addEventListener('load', function () {
    var myInterval = setInterval(function () {
        if (document.querySelector(`:scope ${CST_ID_METACONTENT}`)) {
            addMenu();
            clearInterval(myInterval);
            myInterval = null;
        }
    }, 0.5 * 1000);
});

// **************************************************
// **********         S C R I P T          **********
// **************************************************
function launchDl() {
    if (window.location.href.match(/.*\.youtube.com\/watch\?.*v=[^#&?]*/)) {
        window.open(window.location.href.replace('youtube.com', 'yout.com'), '_blank');
    }
}
