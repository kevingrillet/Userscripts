// ==UserScript==
// @name          [Amazon] Tweaks
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Add total and "add all to cart" for Amazon wishlists + Cart management
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           amazon
// @version       2.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Amazon]%20Tweaks.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Amazon]%20Tweaks.user.js

// @match         https://www.amazon.com/hz/wishlist/*
// @match         https://www.amazon.fr/hz/wishlist/*
// @match         https://www.amazon.co.uk/hz/wishlist/*
// @match         https://www.amazon.de/hz/wishlist/*
// @match         https://www.amazon.it/hz/wishlist/*
// @match         https://www.amazon.es/hz/wishlist/*
// @match         https://www.amazon.com/gp/cart/view.html*
// @match         https://www.amazon.fr/gp/cart/view.html*
// @match         https://www.amazon.co.uk/gp/cart/view.html*
// @match         https://www.amazon.de/gp/cart/view.html*
// @match         https://www.amazon.it/gp/cart/view.html*
// @match         https://www.amazon.es/gp/cart/view.html*
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
                        deleteAll: 'Tout supprimer',
                        saveAll: 'Tout mettre de côté',
                    },
                    en: {
                        quantity: 'Quantity',
                        total: 'Total',
                        article: 'item',
                        articles: 'items',
                        addAllToCart: 'Add all to Cart',
                        deleteAll: 'Delete all',
                        saveAll: 'Save all for later',
                    },
                    de: {
                        quantity: 'Menge',
                        total: 'Gesamt',
                        article: 'Artikel',
                        articles: 'Artikel',
                        addAllToCart: 'Alle in den Einkaufswagen',
                        deleteAll: 'Alles löschen',
                        saveAll: 'Alles für später speichern',
                    },
                    es: {
                        quantity: 'Cantidad',
                        total: 'Total',
                        article: 'artículo',
                        articles: 'artículos',
                        addAllToCart: 'Añadir todo al carrito',
                        deleteAll: 'Eliminar todo',
                        saveAll: 'Guardar todo para más tarde',
                    },
                    it: {
                        quantity: 'Quantità',
                        total: 'Totale',
                        article: 'articolo',
                        articles: 'articoli',
                        addAllToCart: 'Aggiungi tutto al carrello',
                        deleteAll: 'Elimina tutto',
                        saveAll: 'Salva tutto per dopo',
                    },
                },
                cleanUI: true,
                selectors: {
                    crapElements: {
                        carousel: '.copilot-secure-display',
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
            const { carousel, footer } = this.CONFIG.selectors.crapElements;
            document.querySelector(carousel).style.display = 'none';
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

    class Cart extends Amazon {
        constructor() {
            super();
            this.CONFIG = {
                ...this.CONFIG,
                selectors: {
                    ...this.CONFIG.selectors,
                    cartHeader: '.sc-cart-header',
                    deleteButtons: '#sc-active-cart .sc-action-delete',
                    saveButtons: '#sc-active-cart .sc-action-save-for-later',
                    activeCart: '#sc-active-cart',
                    crapElements: {
                        ...this.CONFIG.selectors.crapElements,
                        cart: ['#sc-new-upsell', '#sc-rec-bottom', '#rhf'],
                    },
                },
            };
        }

        init() {
            if (!this.isCartPage()) return;
            super.init();
            this.setupObserver();
            this.setUI();
        }

        isCartPage() {
            return window.location.pathname.includes('/gp/cart/view.html');
        }

        deleteAll() {
            const buttons = Array.from(document.querySelectorAll(this.CONFIG.selectors.deleteButtons));
            if (buttons.length > 0) {
                // Click first button then wait for DOM update
                const firstButton = buttons[0].querySelector('input, a');
                if (firstButton) {
                    firstButton.click();
                    // Wait for DOM update then delete remaining items
                    setTimeout(() => this.deleteAll(), 500);
                }
            }
        }

        saveAll() {
            const buttons = Array.from(document.querySelectorAll(this.CONFIG.selectors.saveButtons));
            if (buttons.length > 0) {
                // Click first button then wait for DOM update
                const firstButton = buttons[0].querySelector('input, a');
                if (firstButton) {
                    firstButton.click();
                    // Wait for DOM update then save remaining items
                    setTimeout(() => this.saveAll(), 500);
                }
            }
        }

        setUI() {
            // Don't add buttons if they already exist or if cart is empty
            if (document.querySelector('#my_delete_all') || !document.querySelector(this.CONFIG.selectors.deleteButtons)) {
                return;
            }

            const template = `
                <div class="a-row a-spacing-base" style="text-align: right; padding: 10px;">
                    <span id="my_save_all" class="a-button a-button-normal a-button-primary" style="margin-right: 10px;">
                        <span class="a-button-inner">
                            <span class="a-button-text">${this.t('saveAll')}</span>
                        </span>
                    </span>
                    <span id="my_delete_all" class="a-button a-button-normal a-button-primary">
                        <span class="a-button-inner">
                            <span class="a-button-text">${this.t('deleteAll')}</span>
                        </span>
                    </span>
                </div>
            `;

            const container = document.querySelector(this.CONFIG.selectors.cartHeader);
            if (container) {
                container.insertAdjacentHTML('beforeend', template);

                // Add event listeners
                document.querySelector('#my_delete_all').addEventListener('click', () => this.deleteAll());
                document.querySelector('#my_save_all').addEventListener('click', () => this.saveAll());
            }
        }

        setupObserver() {
            // Create a more robust observer that watches for cart changes
            const config = {
                childList: true,
                subtree: true,
            };

            const callback = (mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        // Check if cart has items
                        const hasItems = document.querySelector(this.CONFIG.selectors.deleteButtons);
                        // Add buttons if they don't exist and cart has items
                        if (!document.querySelector('#my_delete_all') && hasItems) {
                            this.setUI();
                        }
                    }
                }
            };

            const observer = new MutationObserver(callback);
            const targetNode = document.querySelector('body');
            if (targetNode) {
                observer.observe(targetNode, config);
            }
        }

        removeCrap() {
            super.removeCrap();
            const { cart } = this.CONFIG.selectors.crapElements;
            cart.forEach((selector) => {
                const element = document.querySelector(selector);
                if (element) element.style.display = 'none';
            });
        }
    }

    // Initialize
    window.addEventListener('load', function () {
        const wishlist = new Wishlist();
        const cart = new Cart();
        wishlist.init();
        cart.init();
    });
})();
