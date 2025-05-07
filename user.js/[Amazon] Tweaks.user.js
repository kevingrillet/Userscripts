// ==UserScript==
// @name          [Amazon] Tweaks
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Add total and "add all to cart" for Amazon wishlists
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           amazon
// @version       2.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Amazon]%20Tweaks.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Amazon]%20Tweaks.user.js

// @include       https://www.amazon.com/hz/wishlist/*
// @include       https://www.amazon.fr/hz/wishlist/*
// @include       https://www.amazon.co.uk/hz/wishlist/*
// @include       https://www.amazon.de/hz/wishlist/*
// @include       https://www.amazon.it/hz/wishlist/*
// @include       https://www.amazon.es/hz/wishlist/*
// @icon          https://www.google.com/s2/favicons?domain=amazon.com
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    class Amazon {
        constructor() {
            this.lang = 'en';
            this.CONFIG = {
                i18n: {
                    fr: {
                        quantity: 'Quantité',
                        total: 'Total',
                        article: 'article',
                        articles: 'articles',
                        addAllToCart: 'Tout ajouter au panier',
                    },
                    en: {
                        quantity: 'Quantity',
                        total: 'Total',
                        article: 'item',
                        articles: 'items',
                        addAllToCart: 'Add all to Cart',
                    },
                    de: {
                        quantity: 'Menge',
                        total: 'Gesamt',
                        article: 'Artikel',
                        articles: 'Artikel',
                        addAllToCart: 'Alle in den Einkaufswagen',
                    },
                    es: {
                        quantity: 'Cantidad',
                        total: 'Total',
                        article: 'artículo',
                        articles: 'artículos',
                        addAllToCart: 'Añadir todo al carrito',
                    },
                    it: {
                        quantity: 'Quantità',
                        total: 'Totale',
                        article: 'articolo',
                        articles: 'articoli',
                        addAllToCart: 'Aggiungi tutto al carrello',
                    },
                },
                cleanUI: true,
                selectors: {
                    crapElements: {
                        carousel: '.copilot-secure-display',
                        nav: ['#nav-main', '#nav-progressive-subnav'],
                        footer: ['.navAccessibility', '.navFooterLogoLine', '.navFooterPadItemLine', '.navFooterDescLine'],
                    },
                },
            };
        }

        init() {
            this.lang = this.detectLanguage();
            if (this.CONFIG.cleanUI) this.removeCrap();
        }

        detectLanguage() {
            const domain = window.location.hostname;
            const match = domain.match(/amazon\.([a-z]{2,})/);
            if (match) {
                switch (match[1]) {
                    case 'fr':
                        return 'fr';
                    case 'de':
                        return 'de';
                    case 'es':
                        return 'es';
                    case 'it':
                        return 'it';
                    case 'co.uk':
                    case 'com':
                    default:
                        return 'en';
                }
            }
            return 'en';
        }

        removeCrap() {
            const { carousel, nav, footer } = this.CONFIG.selectors.crapElements;
            document.querySelector(carousel).style.display = 'none';
            nav.forEach((selector) => (document.querySelector(selector).style.display = 'none'));
            footer.forEach((selector) => (document.querySelector(selector).style.display = 'none'));
        }

        t(key) {
            return this.CONFIG.i18n[this.lang][key] || this.CONFIG.i18n['en'][key];
        }
    }

    class Wishlist extends Amazon {
        constructor() {
            super();
            this.loadingTry = 0;
            this.number = 0;
            this.total = 0;
            this.CONFIG = {
                ...this.CONFIG,
                loadSpeed: 100,
                maxLoadingTry: 30,
                selectors: {
                    ...this.CONFIG.selectors,
                    listItems: '#g-items li, ul[role="listbox"] > li',
                    addToCartButtons: '.wl-info-aa_add_to_cart .a-button-inner, span[data-action="reg-item-view-cart"]',
                    priceElement: '.a-offscreen',
                    quantityElements: '.a-box-inner, .a-section',
                    endMarker: '#endOfListMarker',
                },
            };
        }

        init() {
            if (!this.isWishlistPage()) return;
            super.init();
            this.loadAll();
        }

        isWishlistPage() {
            return window.location.pathname.includes('/hz/wishlist');
        }

        addAll() {
            document.querySelectorAll(this.CONFIG.selectors.addToCartButtons).forEach((btn) => btn.click());
        }

        loadAll() {
            if (!document.querySelector(this.CONFIG.selectors.endMarker) && this.loadingTry < this.CONFIG.maxLoadingTry) {
                setTimeout(() => {
                    const items = document.querySelectorAll(this.CONFIG.selectors.listItems);
                    if (items.length) {
                        items[items.length - 1].scrollIntoView();
                    }
                    this.loadingTry++;
                    this.loadAll();
                }, this.CONFIG.loadSpeed);
            } else {
                window.scrollTo({ top: 0 });
                this.calcTotal();
                this.setUI();
            }
        }

        calcTotal() {
            document.querySelectorAll(this.CONFIG.selectors.listItems).forEach((item) => {
                const priceEl = item.querySelector(this.CONFIG.selectors.priceElement);
                let price = 0;
                if (priceEl) {
                    price = Number(priceEl.textContent.replace(/[^0-9,\.]/g, '').replace(',', '.'));
                }

                const quantityBoxes = item.querySelectorAll(this.CONFIG.selectors.quantityElements);
                let requested = 1,
                    purchased = 0;

                quantityBoxes.forEach((box) => {
                    const text = box.textContent;
                    if (text.includes(this.t('quantity'))) {
                        const numbers = text.match(/\d+/g);
                        if (numbers && numbers.length >= 2) {
                            requested = Number(numbers[0]);
                            purchased = Number(numbers[1]);
                        }
                    }
                });

                if (price > 0) {
                    this.number++;
                    this.total += price * (requested - purchased);
                }
            });

            this.total = this.total.toFixed(2).replace('.', ',');
        }

        setUI() {
            const template = `
                <div class="a-column a-span12 a-text-right a-spacing-none a-spacing-top-base a-span-last">
                    <span style="margin-right: 30px">
                        <b>${this.t('total')} (${this.number} ${this.number > 1 ? this.t('articles') : this.t('article')}): ${this.total}€</b>
                    </span>
                    <span class="a-button a-button-normal a-button-primary wl-info-aa_add_to_cart">
                        <span class="a-button-inner" style="width: 220px">
                            <a class="a-button-text a-text-center">${this.t('addAllToCart')}</a>
                        </span>
                    </span>
                </div>
            `;

            const container = document.querySelector('#control-bar');
            container.insertAdjacentHTML('beforeend', template);

            // Add event listener
            container.querySelector('.wl-info-aa_add_to_cart').addEventListener('click', () => this.addAll());
        }
    }

    // Initialize
    window.addEventListener('load', function () {
        const wishlist = new Wishlist();
        wishlist.init();
    });
})();
