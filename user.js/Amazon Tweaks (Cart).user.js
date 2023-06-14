// ==UserScript==
// @name          Amazon Tweaks (Cart)
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Delete / Save for later All.
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.2

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/Amazon%20Tweaks%20(Cart).user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/Amazon%20Tweaks%20(Cart).user.js

// @match         *://www.amazon.fr/gp/cart/view.html*
// @icon          https://www.google.com/s2/favicons?domain=amazon.fr
// @run-at        document-end
// ==/UserScript==

'use strict';

// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var cleanUI = true; // remove crap ui

// **************************************************
// **********         D E L E T E          **********
// **************************************************
function deleteAll() {
    document.querySelectorAll(':scope #sc-active-cart .sc-action-delete').forEach((e) => {
        e.firstElementChild.firstElementChild.click();
    });
}

// **************************************************
// **********           S A V E            **********
// **************************************************
function saveAll() {
    document.querySelectorAll(':scope #sc-active-cart .sc-action-save-for-later').forEach((e) => {
        e.firstElementChild.firstElementChild.click();
    });
}

// **************************************************
// **********             U I              **********
// **************************************************
function setUI() {
    if (document.querySelector('#my_delete_all')) return;
    let el = document.createElement('div');

    el.innerHTML += `
    <span id="my_delete_all" style="float: right;" class="a-button a-spacing-top-none a-button-primary a-button-small">
        <span class="a-button-inner">
            <span class="a-button-text" aria-hidden="true">Tout supprimer</span>
        </span>
    </span>
    <span id="my_save_all" style="float: right;"  class="a-button a-spacing-top-none a-button-primary a-button-small">
        <span class="a-button-inner">
            <span class="a-button-text" aria-hidden="true">Tout mettre de côté</span>
        </span>
    </span>`;

    document.querySelector('.sc-cart-header').insertBefore(el, document.querySelector('.sc-cart-header').firstElementChild);
    el.querySelector('#my_delete_all').onclick = function () {
        deleteAll();
    };
    el.querySelector('#my_save_all').onclick = function () {
        saveAll();
    };
}

function removeCrap() {
    // Header
    document.querySelector('#nav-main').style.display = 'none';
    document.querySelector('#nav-progressive-subnav').style.display = 'none';
    document.querySelector('#sc-new-upsell').style.display = 'none';
    // Footer
    document.querySelector('#sc-rec-bottom').style.display = 'none';
    document.querySelector('#rhf').style.display = 'none';
    document.querySelector('.navAccessibility').style.display = 'none';
    document.querySelector('.navFooterLogoLine').style.display = 'none';
    document.querySelector('.navFooterPadItemLine').style.display = 'none';
    document.querySelector('.navFooterDescLine').style.display = 'none';
}

// **************************************************
// **********       O B S E R V E R        **********
// **************************************************
// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver

// Callback function to execute when mutations are observed
const callback = function (mutationsList) {
    // Use traditional 'for loops' for IE 11
    for (const mutation of mutationsList) {
        for (const node of mutation.addedNodes) {
            if (
                node.classList &&
                node.classList.contains('a-row') &&
                node.classList.contains('sc-subtotal') &&
                node.classList.contains('sc-subtotal-activecart')
            ) {
                run();
            }
        }
    }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);
// Start observing the target node for configured mutations
observer.observe(document.querySelector('#sc-active-cart'), { attributes: true, childList: true, subtree: true });

// **************************************************
// **********       L I S T E N E R        **********
// **************************************************
function run() {
    if (cleanUI) removeCrap();
    setUI();
}

window.addEventListener('load', function () {
    run();
});
