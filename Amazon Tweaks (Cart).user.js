// ==UserScript==
// @name          Amazon Tweaks (Cart)
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Delete / Save for later All.
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://github.com/kevingrillet/Userscripts/raw/main/Amazon%20Tweaks%20(Cart).user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Amazon%20Tweaks%20(Cart).user.js

// @match         *://www.amazon.fr/hz/wishlist/genericItemsPage/*
// @run-at        document-end
// ==/UserScript==


// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var cleanUI = true; // remove crap ui


// **************************************************
// **********             U I              **********
// **************************************************


// **************************************************
// **********         D E L E T E          **********
// **************************************************
function deleteAll() {
    document.querySelectorAll(':scope #sc-active-cart .sc-action-delete').forEach(e => {
        e.firstElementChild.firstElementChild.click();
    });
}

// **************************************************
// **********           S A V E            **********
// **************************************************
function saveAll() {
    document.querySelectorAll(':scope #sc-active-cart .sc-action-save-for-later').forEach(e => {
        e.firstElementChild.firstElementChild.click();
    });
}


// **************************************************
// **********             U I              **********
// **************************************************
function setUI() {
    let el = document.querySelector('.sc-cart-header').lastElementChild;
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

    document.querySelector('#my_delete_all').onclick = function () { deleteAll(); };
    document.querySelector('#my_save_all').onclick = function () { saveAll(); };
}

function removeCrap() {
    // Header
    document.querySelector('#nav-main').style.display = "none";
    document.querySelector('#nav-progressive-subnav').style.display = "none";
    document.querySelector('#sc-new-upsell').style.display = "none";
    // Footer
    document.querySelector('#sc-rec-bottom').style.display = "none";
    document.querySelector('#rhf').style.display = "none";
    document.querySelector('.navAccessibility').style.display = "none";
    document.querySelector('.navFooterLogoLine').style.display = "none";
    document.querySelector('.navFooterPadItemLine').style.display = "none";
    document.querySelector('.navFooterDescLine').style.display = "none";
}


// **************************************************
// **********       L I S T E N E R        **********
// **************************************************
window.addEventListener('load', function () {
    if (cleanUI) removeCrap();
    setUI();
});
