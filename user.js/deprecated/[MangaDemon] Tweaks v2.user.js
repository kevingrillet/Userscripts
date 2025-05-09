// ==UserScript==
// @name          [MangaDemon] Tweaks v2
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Sort Bookmarks, goto next chapter at the ens of page or list of bookmarks if last
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           mangademon.com
// @tag           deprecated
// @version       0.0.3

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/deprecated/[MangaDemon]%20Tweaks%20v2.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/deprecated/[MangaDemon]%20Tweaks%20v2.user.js

// @match         https://demonicscans.org/*
// @match         https://ciorti.online/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=demoncomics.org
// @grant         GM_registerMenuCommand
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    /** BOOKMARK SECTION */
    function sortBookmarks() {
        function sortFunc(a, b) {
            let aCard = a.querySelectorAll('.updates-check-available span'),
                bCard = b.querySelectorAll('.updates-check-available span');

            let aVal =
                    Number(aCard[1]?.innerText?.replace('Last Chapter Uploaded: ', '') || 0) -
                    Number(aCard[0]?.innerText?.replace('Last Chapter Read: ', '') || 0),
                bVal =
                    Number(bCard[1]?.innerText?.replace('Last Chapter Uploaded: ', '') || 0) -
                    Number(bCard[0]?.innerText?.replace('Last Chapter Read: ', '') || 0);

            if (aVal !== 0 && bVal !== 0 && aVal !== bVal) {
                return aVal - bVal;
            } else if (aVal === 0 && bVal !== 0) {
                return 1;
            } else if (aVal !== 0 && bVal === 0) {
                return -1;
            }
            let aTitle = a.querySelector('h1').innerText,
                bTitle = b.querySelector('h1').innerText;
            return aTitle.localeCompare(bTitle);
        }

        let elUl = document.querySelector('#bookmarks-container');

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
        return ((_get_window_Yscroll() + _get_window_height()) / _get_doc_height()) * 100;
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
            let scrollPercent = _get_scroll_percentage() - 1;
            document.getElementById('my_progress_bar').style.setProperty('--scrollAmount', scrollPercent + '%');
            document.getElementById('my_progress_bar').innerHTML = Math.round(scrollPercent) + '%';
        };

        document.addEventListener('scroll', processScroll);
    }

    function addStyles(css) {
        let style = head.appendChild(document.createElement('style'));
        style.type = 'text/css';
        style.innerHTML = css;
    }

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
        window.location.href = window.location.origin + '/bookmarks.php';
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
        if (window.location.href.indexOf('/bookmarks.php') > -1) {
            sortBookmarks();
        } else if (window.location.href.indexOf('/title/') > -1 && window.location.href.indexOf('/chapter/') > -1) {
            addProgressBar();

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

    if (window.location.href.indexOf('/bookmarks.php') > -1) {
        GM_registerMenuCommand('Sort bookmarks', function () {
            sortBookmarks();
        });
    }
})();
