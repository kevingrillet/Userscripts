// ==UserScript==
// @name          [MangaDemon] Tweaks
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Sort Bookmarks, goto next chapter at the end of page, keyboard navigation, and remove ads/Discord/Ko-fi blocks on chapter pages
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           mangademon.com
// @version       1.0.4

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[MangaDemon]%20Tweaks.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[MangaDemon]%20Tweaks.user.js

// @match         https://ciorti.online/*
// @match         https://comicdemons.com/*
// @match         https://demoncomics.org/*
// @match         https://demonicscans.org/*
// @match         https://demonreader.org/*
// @match         https://demontoon.com/*
// @match         https://manga-demon.org/*
// @match         https://mgdemon.org/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=demoncomics.org
// @grant         GM_registerMenuCommand
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    // Configuration constants
    const CONFIG = {
        AUTO_NEXT_SPEED: 0.5 * 1000, // 0.5s
        AUTO_NEXT_BOOKMARK_SPEED: 1 * 1000, // 1s
        SCROLL_SPEED: 1000 / 60, // ~16.67ms (60fps)
        SCROLL_VALUE: 48, // pixels per scroll
        PRERENDER_TYPE: 'prerender', // or 'prefetch'
        ENABLE_REL: true, // enable/disable rel attribute
    };

    const KEYS = {
        PREVIOUS: ['ArrowLeft', 'KeyA', 'KeyQ'],
        SCROLL_UP: ['ArrowUp', 'KeyW', 'KeyZ'],
        NEXT: ['ArrowRight', 'KeyD'],
        SCROLL_DOWN: ['ArrowDown', 'KeyS'],
    };

    const SELECTORS = {
        BOOKMARKS_CONTAINER: 'bookmarks-container',
        BUTTON_NEXT: '.nextchap',
        BUTTON_PREVIOUS: '.prevchap',
        CHAPTER_TITLE: 'h1',
        PROGRESS_BAR: 'my_progress_bar',
        UPDATES_CHECK: '.updates-check-available span',
    };

    /** BOOKMARK SECTION */
    function sortBookmarks() {
        const container = document.getElementById(SELECTORS.BOOKMARKS_CONTAINER);
        if (!container) {
            console.warn('[MangaDemon Tweaks] Bookmarks container not found');
            return;
        }

        function extractChapterNumber(text) {
            return Number(text?.replace(/[^0-9.-]+/g, '') || 0);
        }

        function sortFunc(a, b) {
            const aCard = a.querySelectorAll(SELECTORS.UPDATES_CHECK);
            const bCard = b.querySelectorAll(SELECTORS.UPDATES_CHECK);

            const aVal = extractChapterNumber(aCard[1]?.innerText) - extractChapterNumber(aCard[0]?.innerText);
            const bVal = extractChapterNumber(bCard[1]?.innerText) - extractChapterNumber(bCard[0]?.innerText);

            if (aVal !== 0 && bVal !== 0 && aVal !== bVal) return aVal - bVal;
            if (aVal === 0 && bVal !== 0) return 1;
            if (aVal !== 0 && bVal === 0) return -1;

            const aTitle = a.querySelector(SELECTORS.CHAPTER_TITLE)?.innerText || '';
            const bTitle = b.querySelector(SELECTORS.CHAPTER_TITLE)?.innerText || '';
            return aTitle.localeCompare(bTitle);
        }

        const items = Array.from(container.getElementsByTagName('li'));
        items.sort(sortFunc).forEach((item) => container.appendChild(item));
    }

    /** CHAPTEUR SECTION */
    const NAVIGATION = {
        next: document.querySelector(SELECTORS.BUTTON_NEXT),
        previous: document.querySelector(SELECTORS.BUTTON_PREVIOUS),
    };

    let scrollInterval;

    function _get_window_height() {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
    }

    function _get_window_Yscroll() {
        return window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop || 0;
    }
    function _get_doc_height() {
        return Math.max(
            document.body.scrollHeight || 0,
            document.documentElement.scrollHeight || 0,
            document.body.offsetHeight || 0,
            document.documentElement.offsetHeight || 0,
            document.body.clientHeight || 0,
            document.documentElement.clientHeight || 0
        );
    }

    function _get_scroll_percentage() {
        try {
            const windowScroll = _get_window_Yscroll();
            const windowHeight = _get_window_height();
            const docHeight = _get_doc_height();

            if (docHeight === 0) {
                console.warn('[MangaDemon Tweaks] Invalid document height');
                return 0;
            }

            // Calculate total scrollable area (document height minus window height)
            const scrollable = docHeight - windowHeight;

            // Calculate percentage based on current scroll position relative to scrollable area
            return scrollable > 0 ? (windowScroll / scrollable) * 100 : 100;
        } catch (error) {
            console.error('[MangaDemon Tweaks] Error calculating scroll percentage:', error);
            return 0;
        }
    }

    function addProgressBar() {
        let elDiv = document.body.appendChild(document.createElement('div'));
        elDiv.id = 'my_progress_bar';

        addStyles(`
            #my_progress_bar {
                --scrollAmount: 0%;
                color: rgba(0,0,0,0);
                font-size: .75rem;
                text-align: right;
                top: 0;
                height: .5rem;
                position: fixed;
                vertical-align: middle;
                background-image: linear-gradient(120deg, #800080 0%, #FF0000 100%);
                width: var(--scrollAmount);
                transition: height 100ms, color 100ms;
                z-index: 9999;
            }
            #my_progress_bar:before {
                content: "";
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: 100%;
                box-sizing: border-box;
                border: 1px solid rgba(0, 0, 0, .75);
                border-left: 0;
            }
            #my_progress_bar:hover {
                color: black;
                height: 1rem;
            }`);

        let processScroll = () => {
            let scrollPercent = _get_scroll_percentage();
            document.getElementById(SELECTORS.PROGRESS_BAR).style.setProperty('--scrollAmount', scrollPercent + '%');
            document.getElementById(SELECTORS.PROGRESS_BAR).innerHTML = Math.round(scrollPercent) + '%';
        };

        processScroll();

        document.addEventListener('scroll', processScroll);
    }

    function addStyles(css) {
        let style = document.head.appendChild(document.createElement('style'));
        style.type = 'text/css';
        style.innerHTML = css;
    }

    function autoNext() {
        // Auto next when scroll to the bottom
        if (Math.round(window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
            setTimeout(function () {
                if (Math.round(window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
                    if (NAVIGATION.next && NAVIGATION.next !== undefined) {
                        goNext();
                    } else {
                        setTimeout(function () {
                            goBookmark();
                        }, CONFIG.AUTO_NEXT_BOOKMARK_SPEED); // wait 4 secs
                    }
                }
            }, CONFIG.AUTO_NEXT_SPEED); // wait 1 secs
        }
    }

    function cleanChapterAds() {
        const container = document.querySelector('.main-width.center-m');
        if (!container) return;

        const btn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('CLICK HERE IF IMAGES ARE NOT LOADING'));
        if (!btn) return;

        let node = btn.parentNode;
        let startNode = node;
        let endNode = null;
        let found = false;

        while (node && node.nextSibling) {
            node = node.nextSibling;
            if (node.nodeType === Node.COMMENT_NODE && node.nodeValue.trim().startsWith('Cached copy')) {
                endNode = node;
                found = true;
                break;
            }
        }

        if (!found) return;

        node = startNode.nextSibling;
        while (node && node !== endNode) {
            let toRemove = node;
            node = node.nextSibling;
            toRemove.remove();
        }
    }

    function goBookmark() {
        window.location.href = window.location.origin + '/bookmarks.php';
    }
    function goNext() {
        if (NAVIGATION.next?.href) {
            window.location.href = NAVIGATION.next.href;
        }
    }
    function goPrevious() {
        if (NAVIGATION.previous?.href) {
            window.location.href = NAVIGATION.previous.href;
        }
    }

    function prerender(force) {
        if (!CONFIG.ENABLE_REL) return;
        force = force || false;
        if (NAVIGATION.next && NAVIGATION.next !== undefined) {
            if (NAVIGATION.next.rel === 'nofollow') {
                if (force || Math.round(window.innerHeight + window.scrollY) >= document.body.offsetHeight * 0.75) {
                    let link = document.head.appendChild(document.createElement('link'));
                    link.setAttribute('rel', CONFIG.PRERENDER_TYPE);
                    link.setAttribute('href', NAVIGATION.next.href);
                    NAVIGATION.next.setAttribute('rel', CONFIG.PRERENDER_TYPE);
                    console.debug('Prerender added.');
                }
            }
        }
    }
    function startScrolling(value) {
        scrollInterval = setInterval(function () {
            window.scrollBy(0, value);
        }, CONFIG.SCROLL_SPEED);
    }
    function stopScrolling() {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }

    function handleKeyDown(event) {
        if (event.ctrlKey || event.code === 'MetaLeft' || event.code === 'MetaRight') {
            return;
        }

        if (KEYS.PREVIOUS.includes(event.code)) {
            goPrevious();
        } else if (KEYS.SCROLL_UP.includes(event.code)) {
            stopScrolling();
            startScrolling(-CONFIG.SCROLL_VALUE);
        } else if (KEYS.NEXT.includes(event.code)) {
            goNext();
        } else if (KEYS.SCROLL_DOWN.includes(event.code)) {
            stopScrolling();
            startScrolling(CONFIG.SCROLL_VALUE);
        }
    }

    function handleKeyUp(event) {
        if (KEYS.SCROLL_UP.includes(event.code) || KEYS.SCROLL_DOWN.includes(event.code)) {
            stopScrolling();
        }
    }

    const PAGE_TYPE = {
        isBookmarkPage: () => window.location.href.includes('/bookmarks.php'),
        isChapterPage: () => window.location.href.includes('/title/') && window.location.href.includes('/chapter/'),
    };

    /** MAIN SECTION */
    window.addEventListener('load', function () {
        if (PAGE_TYPE.isBookmarkPage()) {
            sortBookmarks();
        } else if (PAGE_TYPE.isChapterPage()) {
            addProgressBar();
            cleanChapterAds();

            window.onscroll = function () {
                autoNext();
                prerender();
            };

            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);
        }
    });

    if (PAGE_TYPE.isBookmarkPage()) {
        GM_registerMenuCommand('Sort bookmarks', function () {
            sortBookmarks();
        });
    }
})();
