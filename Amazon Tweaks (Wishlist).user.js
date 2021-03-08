// ==UserScript==
// @name          Amazon Tweaks (Whishlist)
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Add total and "add all to cart".
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.2

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://github.com/kevingrillet/Userscripts/raw/main/Amazon%20Tweaks%20(Whishlist).user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Amazon%20Tweaks%20(Whishlist).user.js

// @match         *://www.amazon.fr/hz/wishlist/*
// @run-at        document-end
// ==/UserScript==

var total = 0;

document.querySelectorAll(':scope #g-items .g-item-sortable').forEach(e => {
    let price = Number(e.querySelector('.a-offscreen').innerHTML.replace(',','.').replace('&nbsp;€','')),
        quantity = e.querySelectorAll('.a-box-inner')[1].querySelectorAll('.a-letter-space'),
        requested = quantity[1].nextElementSibling.innerHTML,
        purchased = quantity[3].nextElementSibling.innerHTML;
    total += price * (requested - purchased);
});

total = total.toString().replace('.',',');

var el = document.querySelector('#control-bar').appendChild(document.createElement('div'));
el.classList.add('a-column', 'a-span6', 'a-text-right', 'a-spacing-none', 'a-spacing-top-base', 'a-span-last');
el.innerHTML = `Total: ${total} €`;
