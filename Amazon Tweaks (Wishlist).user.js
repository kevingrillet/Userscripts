// ==UserScript==
// @name          Amazon Tweaks (Whishlist)
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Add total and "add all to cart".
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Amazon%20Tweaks%20(Whishlist).user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Amazon%20Tweaks%20(Whishlist).user.js

// @match         *://www.amazon.fr/hz/wishlist/genericItemsPage/*
// @run-at        document-end
// ==/UserScript==


// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var cleanUI = true, // remove crap ui
    loadSpeed = .1 * 1000, //Refresh speed during load.
    maxLoadingTry = 30;


// **************************************************
// **********      V A R I A B L E S       **********
// **************************************************
var loadingTry = 0,
    number = 0,
    total = 0;


// **************************************************
// **********           C A R T            **********
// **************************************************
function addAll() {
    document.querySelectorAll(':scope #g-items .g-item-sortable .wl-info-aa_add_to_cart .a-button-inner').forEach(e => {
        e.click();
    });
}


// **************************************************
// **********           L O A D            **********
// **************************************************
// **************************************************
function loadAll() {
    if (!document.querySelector('#endOfListMarker') && loadingTry < maxLoadingTry) {
        setTimeout(function () {
            document.querySelectorAll(':scope #g-items li')[document.querySelectorAll(':scope #g-items li').length - 1].scrollIntoView(/*{behavior: "smooth"}*/);
            loadingTry++;
            loadAll();
        }, loadSpeed);
    } else {
        window.scrollTo({ top: 0/*, behavior: 'smooth'*/ });
        calcTotal();
        setUI();
    }
}


// **************************************************
// **********          T O T A L           **********
// **************************************************
function calcTotal() {
    document.querySelectorAll(':scope #g-items .g-item-sortable').forEach(e => {
        let price = Number(e.querySelector('.a-offscreen') ? e.querySelector('.a-offscreen').innerHTML.replace(',', '.').replace('&nbsp;€', '') : 0),
            quantity = e.querySelectorAll('.a-box-inner')[1].querySelectorAll('.a-letter-space'),
            requested = quantity[1].nextElementSibling.innerHTML,
            purchased = quantity[3].nextElementSibling.innerHTML;
        number++;
        total += price * (requested - purchased);
    });

    total = total.toFixed(2).toString().replace('.', ',');
}


// **************************************************
// **********             U I              **********
// **************************************************
function setUI() {
    let el = document.querySelector('#control-bar').appendChild(document.createElement('div'));
    el.classList.add('a-column', 'a-span12', 'a-text-right', 'a-spacing-none', 'a-spacing-top-base', 'a-span-last');
    el.innerHTML = `<span style="margin-right: 30px"><b>Total (${number} article${number > 1 ? 's' : ''}): ${total}€ </b></span>`;
    el = el.appendChild(document.createElement('span'));
    el.classList.add('a-button', 'a-button-normal', 'a-button-primary', 'wl-info-aa_add_to_cart');
    el.innerHTML = `<span class="a-button-inner" style="width: 220px"><a class="a-button-text a-text-center">Tout ajouter au panier</a></span>`;
    el.onclick = function () { addAll(); };
}

function removeCrap() {
    // remove useless carousel at the bottom
    document.querySelector('.copilot-secure-display').style.display = "none";
    // remove useless nav crap
    document.querySelector('#nav-main').style.display = "none";
    document.querySelector('#nav-progressive-subnav').style.display = "none";
    // remove useless footer crap
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
    loadAll();
});
