// ==UserScript==
// @name          [MangaDemon] Tweaks
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Sort Bookmarks, goto next chapter at the ens of page or list of bookmarks if last
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.4

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[MangaDemon]%20Tweaks.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[MangaDemon]%20Tweaks.user.js

// @match         https://manga-demon.org/*
// @match         https://demoncomics.org/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=demoncomics.org
// @grant         none
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    /** BOOKMARK SECTION */
    function sortBookmarks() {
        function sortFunc(a, b) {
            let aCard = a.querySelectorAll('.chapternumber'),
                bCard = b.querySelectorAll('.chapternumber');

            let aVal = Number(aCard[1].innerText.replace('Last Chapter ', '')) - Number(aCard[0].innerText.replace('Last Chapter Read ', '')),
                bVal = Number(bCard[1].innerText.replace('Last Chapter ', '')) - Number(bCard[0].innerText.replace('Last Chapter Read ', ''));

            if (aVal !== 0 && bVal !== 0 && aVal !== bVal) {
                return aVal - bVal;
            } else if (aVal === 0 && bVal !== 0) {
                return 1;
            } else if (aVal !== 0 && bVal === 0) {
                return -1;
            }
            let aTitle = a.querySelector('.novel-title').innerText,
                bTitle = b.querySelector('.novel-title').innerText;
            return aTitle.localeCompare(bTitle);
        }

        let elUl = document.querySelector(':scope .latestupdates ul');

        Array.from(elUl.getElementsByTagName('li'))
            .sort((a, b) => sortFunc(a, b))
            .forEach((elLi) => elUl.appendChild(elLi));
    }

    /** CHAPTEUR SECTION */
    var autoNextSpeed = 0.5 * 1000, // .5 s
        autoNextBookmarkSpeed = 1 * 1000, // +1 s
        buttonNext = document.querySelector('.nextchap'),
        buttonPrevious = document.querySelector('.prevchap'),
        doRel = true, // does rel is added on scroll
        head = document.head,
        rel = 'prerender', // prerender/prefetch;
        scrollInterval,
        scrollSpeed = 1000 / 60, // 1/60 s
        scrollValue = 48; // px;

    function autoNext() {
        // Auto next when scroll to the bottom
        if (Math.round(window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
            setTimeout(function () {
                if (Math.round(window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
                    if (buttonNext && buttonNext !== undefined) {
                        goNext();
                    } else {
                        setTimeout(function () {
                            goBookmark();
                        }, autoNextBookmarkSpeed); // wait 4 secs
                    }
                }
            }, autoNextSpeed); // wait 1 secs
        }
    }

    function goBookmark() {
        window.location.href = window.location.origin + '/following.php';
    }
    function goNext() {
        if (buttonNext) {
            buttonNext.click();
        }
    }
    function goPrevious() {
        if (buttonPrevious) {
            buttonPrevious.click();
        }
    }

    function prerender(force) {
        if (!doRel) return;
        force = force || false;
        if (buttonNext && buttonNext !== undefined) {
            if (buttonNext.rel === 'nofollow') {
                if (force || Math.round(window.innerHeight + window.scrollY) >= document.body.offsetHeight * 0.75) {
                    let link = head.appendChild(document.createElement('link'));
                    link.setAttribute('rel', rel);
                    link.setAttribute('href', buttonNext.href);
                    buttonNext.setAttribute('rel', rel);
                    console.debug('Prerender added.');
                }
            }
        }
    }
    function startScrolling(value) {
        scrollInterval = setInterval(function () {
            window.scrollBy(0, value);
        }, scrollSpeed);
    }
    function stopScrolling() {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }

    /** MAIN SECTION */
    window.addEventListener('load', function () {
        if (window.location.href.indexOf('/following.php') > -1) {
            sortBookmarks();
        } else if (window.location.href.indexOf('/manga/') > -1) {
            window.onscroll = function () {
                autoNext();
                prerender();
            };

            document.addEventListener('keydown', (event) => {
                if (event.ctrlKey || event.code === 'MetaLeft' || event.code === 'MetaRight') {
                    return;
                }
                if (event.code === 'ArrowLeft' || event.code === 'KeyA' || event.code === 'KeyQ') {
                    goPrevious();
                } else if (event.code === 'ArrowUp' || event.code === 'KeyW' || event.code === 'KeyZ') {
                    stopScrolling();
                    startScrolling(-scrollValue);
                } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
                    goNext();
                } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
                    stopScrolling();
                    startScrolling(scrollValue);
                }
            });

            document.addEventListener('keyup', (event) => {
                if (event.code === 'ArrowUp' || event.code === 'KeyW' || event.code === 'KeyZ' || event.code === 'ArrowDown' || event.code === 'KeyS') {
                    stopScrolling();
                }
            });
        }
    });
})();
