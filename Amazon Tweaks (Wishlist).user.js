// ==UserScript==
// @name          Amazon Tweaks (Whishlist)
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Add total and "add all to cart".
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://github.com/kevingrillet/Userscripts/raw/main/Amazon%20Tweaks%20(Whishlist).user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Amazon%20Tweaks%20(Whishlist).user.js

// @match         *://www.amazon.fr/hz/wishlist/*
// @run-at        document-end
// ==/UserScript==

var total = 0;

document.querySelectorAll(':scope #wl-item-view .a-offscreen').forEach(p => {
    total += Number(p.innerHTML.replace(',','.').replace('&nbsp;€',''));
});

total = Number(total).toString().replace('.',',');
console.log(total + ' €');
