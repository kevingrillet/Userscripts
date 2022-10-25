// ==UserScript==
// @name          Manganelo Tweaks (Chapter)
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Auto next, Duplicate chapter, Export, Reloading on error, Margin, Prerender, Removes Add div, Scrolling, Shortcuts ←/A/Q (previous), →/D (previous), ↑/W/Z (scroll up), ↓/S (scroll down) B (bookmark page), H (home page)
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.26

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/Manganelo%20Tweaks%20(Chapter).user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/Manganelo%20Tweaks%20(Chapter).user.js

// @match         *://manganelo.com/chapter/*/*
// @match         *://readmanganato.com/manga-*/*
// @match         *://chapmanganato.com/manga-*/*
// @match         *://chapmanganelo.com/manga-*/*
// @icon          https://www.google.com/s2/favicons?domain=manganato.com
// @grant         GM_download
// @grant         GM_getValue
// @grant         GM_setValue
// @require       https://use.fontawesome.com/releases/v5.15.2/js/all.js
// @run-at        document-end
// ==/UserScript==

"use strict";


// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var autoNextSpeed = .5 * 1000, // .5 s
    autoNextBookmarkSpeed = 1 * 1000, // +1 s
    imagesMargin = 0, // px
    maxWidth = GM_getValue('maxWidth', document.body.offsetWidth > 1280 ? 80 : 90), // %
    rel = 'prerender', // prerender/prefetch
    doRel = true, // does rel is added on scroll
    scrollSpeed = 1000 / 60, // 1/60 s
    scrollValue = 48, // px
    zoomW = 5, // % zoom delta
    env = [
        {
            name: 'Manganelo', // Name
            match: '^.*://manganelo.com/chapter/.*/.*', // Match needed to know we are here
            url_home: 'https://manganelo.com/', // Url to homepage
            url_bookmark: 'https://manganelo.com/bookmark', // Url to bookmark
            class_breadcrumb: 'panel-breadcrumb', // class to find breadcrumb
            class_btn_next: 'navi-change-chapter-btn-next a-h', // class to find the button next
            class_btn_previous: 'navi-change-chapter-btn-prev a-h', // class to find the button previous
            class_change_chapter: 'navi-change-chapter', // class to find the combo chapter
            class_img: 'container-chapter-reader', // class to find the pages (images)
            class_img_srv_warn: 'server-image-caption', // class to find the red line crap
            class_logo: 'panel-logo-chapter', // class to find the banner
            class_margin: 'server-cbb-content-margin', // class to find the combo margin
            class_title: 'panel-chapter-info-top' // class to find the title for google search
        },
        {
            name: 'Readmanganato', // Name
            match: '^.*://readmanganato.com/manga-.*/.*', // Match needed to know we are here
            url_home: 'https://manganato.com/', // Url to homepage
            url_bookmark: 'https://manganato.com/bookmark', // Url to bookmark
            class_breadcrumb: 'panel-breadcrumb', // class to find breadcrumb
            class_btn_next: 'navi-change-chapter-btn-next a-h', // class to find the button next
            class_btn_previous: 'navi-change-chapter-btn-prev a-h', // class to find the button previous
            class_change_chapter: 'navi-change-chapter', // class to find the combo chapter
            class_img: 'container-chapter-reader', // class to find the pages (images)
            class_img_srv_warn: 'server-image-caption', // class to find the red line crap
            class_logo: 'panel-logo-chapter', // class to find the banner
            class_margin: 'server-cbb-content-margin', // class to find the combo margin
            class_title: 'panel-chapter-info-top' // class to find the title for google search
        },
        {
            name: 'Chapmanganato', // Name
            match: '^.*://chapmanganato.com/manga-.*/.*', // Match needed to know we are here
            url_home: 'https://manganato.com/', // Url to homepage
            url_bookmark: 'https://manganato.com/bookmark', // Url to bookmark
            class_breadcrumb: 'panel-breadcrumb', // class to find breadcrumb
            class_btn_next: 'navi-change-chapter-btn-next a-h', // class to find the button next
            class_btn_previous: 'navi-change-chapter-btn-prev a-h', // class to find the button previous
            class_change_chapter: 'navi-change-chapter', // class to find the combo chapter
            class_img: 'container-chapter-reader', // class to find the pages (images)
            class_img_srv_warn: 'server-image-caption', // class to find the red line crap
            class_logo: 'panel-logo-chapter', // class to find the banner
            class_margin: 'server-cbb-content-margin', // class to find the combo margin
            class_title: 'panel-chapter-info-top' // class to find the title for google search
        },
        {
            name: 'Chapmanganelo', // Name
            match: '^.*://chapmanganelo.com/manga-.*/.*', // Match needed to know we are here
            url_home: 'https://m.manganelo.com/wwww', // Url to homepage
            url_bookmark: 'https://m.manganelo.com/bookmark', // Url to bookmark
            class_breadcrumb: 'panel-breadcrumb', // class to find breadcrumb
            class_btn_next: 'navi-change-chapter-btn-next a-h', // class to find the button next
            class_btn_previous: 'navi-change-chapter-btn-prev a-h', // class to find the button previous
            class_change_chapter: 'navi-change-chapter', // class to find the combo chapter
            class_img: 'container-chapter-reader', // class to find the pages (images)
            class_img_srv_warn: 'server-image-caption', // class to find the red line crap
            class_logo: 'panel-logo-chapter', // class to find the banner
            class_margin: 'server-cbb-content-margin', // class to find the combo margin
            class_title: 'panel-chapter-info-top' // class to find the title for google search
        },
    ];


// **************************************************
// **********      V A R I A B L E S       **********
// **************************************************
var CST_HOME = null,
    CST_BOOKMARK = null,
    CST_CLASS_BREADCRUMB = null,
    CST_CLASS_BTN_NEXT = null,
    CST_CLASS_BTN_PREVIOUS = null,
    CST_CLASS_CHANGE_CHAPTER = null,
    CST_CLASS_IMG = null,
    CST_CLASS_IMG_SRV_WARN = null,
    CST_CLASS_LOGO = null,
    CST_CLASS_MARGIN = null,
    CST_CLASS_TITLE = null;

env.some(function (e) {
    if (e.match && new RegExp(e.match, 'i').test(window.location.href)) {
        CST_HOME = e.url_home;
        CST_BOOKMARK = e.url_bookmark;
        CST_CLASS_BREADCRUMB = '.' + e.class_breadcrumb.replace(' ', '.');
        CST_CLASS_BTN_NEXT = '.' + e.class_btn_next.replace(' ', '.');
        CST_CLASS_BTN_PREVIOUS = '.' + e.class_btn_previous.replace(' ', '.');
        CST_CLASS_CHANGE_CHAPTER = '.' + e.class_change_chapter.replace(' ', '.');
        CST_CLASS_IMG = '.' + e.class_img.replace(' ', '.');
        CST_CLASS_IMG_SRV_WARN = '.' + e.class_img_srv_warn.replace(' ', '.');
        CST_CLASS_LOGO = '.' + e.class_logo.replace(' ', '.');
        CST_CLASS_MARGIN = '.' + e.class_margin.replace(' ', '.');
        CST_CLASS_TITLE = '.' + e.class_title.replace(' ', '.');
    }
});

var buttonNext = document.querySelector(CST_CLASS_BTN_NEXT),
    buttonPrevious = document.querySelector(CST_CLASS_BTN_PREVIOUS),
    chapterMax = Number(document.querySelector(CST_CLASS_CHANGE_CHAPTER).options[0].getAttribute('data-c')),
    chapterCurrent = Number(document.querySelector(CST_CLASS_CHANGE_CHAPTER).selectedOptions[0].getAttribute('data-c')),
    head = document.head,
    images = document.querySelectorAll(`:scope ${CST_CLASS_IMG} img`),
    // eslint-disable-next-line no-unused-vars
    scrollInterval,
    timerStart = Date.now();


// **************************************************
// **********     D U P L I C A T E D      **********
// **************************************************
function doDuplicated() {
    if ((buttonNext ? buttonNext.href : null) === window.location.href) {
        console.debug('Duplicated chapter :(');
        // If the button next Exists & in the combo there is a Selected-2 element, there is a next chapter :)
        let tmp = document.querySelector(CST_CLASS_CHANGE_CHAPTER).options[document.querySelector(CST_CLASS_CHANGE_CHAPTER).selectedIndex - 2];
        if (buttonNext && tmp) {
            let url = buttonNext.href.replace(/\d+(?:\.\d+)?$/, tmp.getAttribute('data-c'));
            document.querySelectorAll(CST_CLASS_BTN_NEXT).forEach((e) => { e.href = url });
        } else {
            buttonNext = null;
            document.querySelectorAll(CST_CLASS_BTN_NEXT).forEach((e) => { e.remove(); });
        }
    }
}


// **************************************************
// **********           M E N U            **********
// **************************************************
// require: https://use.fontawesome.com/releases/v5.15.2/js/all.js
function addStyles(css) {
    let style = head.appendChild(document.createElement('style'));
    style.type = 'text/css';
    style.innerHTML = css;
}

function addMenu() {
    addStyles(`
    #my_footer { text-align: center; position: fixed; bottom: 5px; left: 5px; opacity: 0; transition:opacity 100ms;}
    #my_footer:hover { opacity: 1}
    #my_footer a { color: inherit; }
    #my_footer a:link { text-decoration: none; }
    #my_footer a:visited { text-decoration: none; color: PaleTurquoise; }
    #my_footer a:hover { text-decoration: underline; }
    #my_footer a:active { text-decoration: underline; }
    #my_footer p { font-family: consolas; font-size: 1em; color: GhostWhite; }
    #my_footer span { cursor: pointer; font-size: 1em; color: GhostWhite; }
    `);

    let elDiv = document.body.appendChild(document.createElement('div'));
    elDiv.id = 'my_footer';
    elDiv.innerHTML = `
    <p class="chap" title="${chapterCurrent.toString() + " / " + chapterMax.toString()}">${(chapterMax - chapterCurrent).toFixed(0).toString()}</p>
    <span class="export" title="Export (Shift + E)">
    <a><i class="fas fa-fw fa-file-download" ></i></a>
    </span>
    </br>
    <span>
    <a class="goManga" href="${document.querySelectorAll(`:scope ${CST_CLASS_BREADCRUMB} a`)[1].href}" title="Manga (M)" ><i class="fas fa-fw fa-book" ></i></a>
    </span>
    <span>
    <a class="my_search" href="https://www.google.com/search?q=${encodeURI(document.querySelector(CST_CLASS_TITLE).firstElementChild.innerText)}" target="_blank" title="Search (F)" ><i class="fas fa-fw fa-search" ></i></a>
    </span>
    </br>
    <span class="home">
    <a class="goHome" href="${CST_HOME}" title="Homepage (H)"><i class="fas fa-fw fa-home" ></i></a>
    </span>
    <span class="bookmark">
    <a class="goBookmark" href="${CST_BOOKMARK}" title="Bookmark (B)"><i class="fas fa-fw fa-bell" ></i></a>
    </span>
    <br/>
    <span class="unzoom">
    <i class="fas fa-fw fa-search-minus" ></i>
    </span>
    <span class="zoom">
    <i class="fas fa-fw fa-search-plus" ></i>
    </span>
    <br/>
    <span class="goUp" title="Scroll up (↑/W/Z)" >
    <i class="fas fa-fw fa-angle-up" ></i>
    </span>
    <span class="goDown" title="Scroll down (↓/S)">
    <i class="fas fa-fw fa-angle-down" ></i>
    </span>
    <br/>
    <span class="goPrevious" title="Not found (←/A/Q)">
    <a><i class="fas fa-fw fa-angle-double-left" ></i></a>
    </span>
    <span class="goNext" title="Not found (→/D)">
    <a><i class="fas fa-fw fa-angle-double-right" ></i></a>
    </span>
    <br/>
    <p class="load" style="font-size: .7em;">
    <i class="fas fa-fw fa-spinner fa-pulse"></i>
    </p>
    `;

    if (chapterMax - chapterCurrent === 0) {
        document.querySelector('.chap').style.color = 'PaleGreen';
    }
    document.querySelector('.export').onclick = function () { downloadImages(); };
    document.querySelector('.goUp').onclick = function () { window.scrollBy({ top: 5 * -scrollValue, left: 0, behavior: 'smooth' }); };
    document.querySelector('.goDown').onclick = function () { window.scrollBy({ top: 5 * scrollValue, left: 0, behavior: 'smooth' }); };
    document.querySelector('.unzoom').onclick = function () { unzoom(); };
    document.querySelector('.zoom').onclick = function () { zoom(); };
    if (buttonPrevious) {
        document.querySelector('.goPrevious').firstElementChild.href = buttonPrevious.href;
        document.querySelector('.goPrevious').firstElementChild.title = document.querySelector(CST_CLASS_CHANGE_CHAPTER).options[document.querySelector(CST_CLASS_CHANGE_CHAPTER).selectedIndex + 1].value + ' (←/A/Q)';
    }
    else {
        document.querySelector('.goPrevious').style.color = 'Tomato';
    }
    if (buttonNext) {
        document.querySelector('.goNext').firstElementChild.href = buttonNext.href;
        document.querySelector('.goNext').firstElementChild.title = document.querySelector(CST_CLASS_CHANGE_CHAPTER).options[document.querySelector(CST_CLASS_CHANGE_CHAPTER).selectedIndex - 1].value + ' (→/D)';
    }
    else {
        document.querySelector('.goNext').style.color = 'Tomato';
    }
}


// **************************************************
// **********             U I              **********
// **************************************************
function clearUI() {
    document.querySelector(CST_CLASS_LOGO).style.display = 'none';
    let e = document.querySelector(CST_CLASS_IMG_SRV_WARN);
    e.parentElement.parentElement.style.margin = '0';
    e.style.display = 'none';
    e = e.nextElementSibling;
    e.style.alignItems = 'center';
    e.style.justifyContent = 'center';
    e.style.display = 'flex';
    e.style.flexDirection = 'row';
    for (let child of e.children) {
        child.style.display = 'flex';
        child.style.margin = '0px 10px';
    }
    document.querySelector(CST_CLASS_IMG).nextElementSibling.style.display = 'none';
}


// **************************************************
// **********           A D D S            **********
// **************************************************
function removeAdds() {
    document.querySelectorAll(':scope div script[async="async"]').forEach((e) => { e.parentElement.parentElement.style.display = "none"; })
    document.querySelectorAll('iframe').forEach((i) => { i.parentNode.style.display = "none" });
    document.body.style.display = "block";
}



// **************************************************
// **********      A U T O   N E X T       **********
// **************************************************
function autoNext() {
    // Auto next when scroll to the bottom
    if (Math.round(window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
        setTimeout(function () {
            if (Math.round(window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
                if (buttonNext && buttonNext !== undefined) {
                    goNext();
                }
                else {
                    setTimeout(function () {
                        goBookmark();
                    }, autoNextBookmarkSpeed); // wait 4 secs
                }
            }
        }, autoNextSpeed); // wait 1 secs
    }
}


// **************************************************
// **********      P R E R E N D E R       **********
// **************************************************
function prerender(force) {
    if (!doRel) return;
    force = force || false;
    if (buttonNext && buttonNext !== undefined) {
        if (buttonNext.rel === 'nofollow') {
            if (force || Math.round(window.innerHeight + window.scrollY) >= document.body.offsetHeight * .75) {
                let link = head.appendChild(document.createElement('link'));
                link.setAttribute('rel', rel);
                link.setAttribute('href', buttonNext.href);
                buttonNext.setAttribute('rel', rel);
                console.debug('Prerender added.')
            }
        }
    }
}


// **************************************************
// **********         R E L O A D          **********
// **************************************************
function reloadImage(pThis) {
    if (pThis && pThis.src) {
        pThis.setAttribute('try', pThis.hasAttribute('try') ? Number(pThis.getAttribute('try')) + 1 : 1);
        if (Number(pThis.getAttribute('try')) > 5) {
            console.debug('Failed to load: ' + pThis.src);
            pThis.removeAttribute('onerror');
        } else {
            console.debug('Failed to load (' + pThis.getAttribute('try') + '): ' + pThis.src);
        }
    }
}

function setReload() {
    let script = head.appendChild(document.createElement('script'));
    script.appendChild(document.createTextNode(reloadImage));

    for (let i of images) {
        if (i && i.src) {
            i.setAttribute('onerror', 'reloadImage(this);');
        }
    }
}


// **************************************************
// **********      G R A Y S C A L E       **********
// **************************************************
function toogleGrayscale(pThis) {
    if (pThis && pThis.src) {
        if (pThis.style.filter) {
            pThis.style.removeProperty('filter');
        } else {
            pThis.style.filter = "grayscale(1)";
        }
    }
}

function setGrayscale() {
    let script = head.appendChild(document.createElement('script'));
    script.appendChild(document.createTextNode(toogleGrayscale));
    for (let i of images) {
        if (i && i.src) {
            i.setAttribute('onclick', 'toogleGrayscale(this);');
        }
    }
}


// **************************************************
// **********         M A R G I N          **********
// **************************************************
function setMargin(value) {
    for (let i of images) {
        i.style.marginTop = value + 'px';
    }
}

function doSetMargin() {
    if (document.querySelector(CST_CLASS_MARGIN).selectedIndex !== imagesMargin) {
        if (imagesMargin >= 0 && imagesMargin <= 10) {
            document.querySelector(CST_CLASS_MARGIN).selectedIndex = imagesMargin;
        }
        setMargin(imagesMargin);
    }
}


// **************************************************
// **********      M A X   W I D T H       **********
// **************************************************
function setMaxWidth(value) {
    GM_setValue('maxWidth', value)
    if (value <= 10) {
        document.querySelector('.unzoom').onclick = null;
        document.querySelector('.unzoom').style.color = 'Tomato';
        document.querySelector('.unzoom').title = 'Min';
    } else {
        document.querySelector('.unzoom').onclick = function () { unzoom(); };
        document.querySelector('.unzoom').style.color = 'GhostWhite';
        document.querySelector('.unzoom').title = (value - zoomW).toString() + '%';
    }
    if (value >= 100) {
        document.querySelector('.zoom').onclick = null;
        document.querySelector('.zoom').style.color = 'Tomato';
        document.querySelector('.zoom').title = 'Max';
    } else {
        document.querySelector('.zoom').onclick = function () { zoom(); };
        document.querySelector('.zoom').title = (value + zoomW).toString() + '%';
        document.querySelector('.zoom').style.color = 'GhostWhite';
    }
    for (let i of images) {
        i.style.maxWidth = value + '%';
    }
}

function zoom() {
    maxWidth += zoomW;
    setMaxWidth(maxWidth);
}
function unzoom() {
    maxWidth -= zoomW;
    setMaxWidth(maxWidth);
}


// **************************************************
// **********      S C R O L L I N G       **********
// **************************************************
function startScrolling(value) {
    scrollInterval = setInterval(function () {
        window.scrollBy(0, value);
    }, scrollSpeed)
}
function stopScrolling() {
    clearInterval(scroll);
    scrollInterval = null;
}


// **************************************************
// **********     N A V I G A T I O N      **********
// **************************************************
function goBookmark() {
    document.querySelector('.goBookmark').click();
}
function goHome() {
    document.querySelector('.goHome').click();
}
function goManga() {
    document.querySelector('.goManga').click();
}
function goNext() {
    if (buttonNext) {
        document.querySelector('.goNext').firstElementChild.click();
    }
}
function goPrevious() {
    if (buttonPrevious) {
        document.querySelector('.goPrevious').firstElementChild.click();
    }
}


// **************************************************
// **********       D O W N L O A D        **********
// **************************************************
// issue https://github.com/Tampermonkey/tampermonkey/issues/1113
//function downloadImages() {
//    let cnt = 0;
//    for (let i of images) {
//        GM_download(i.src, `${document.querySelector(CST_CLASS_TITLE).firstElementChild.innerText}_${++cnt}`);
//    }
//}
function downloadImages(value) {
    value = value || 0;
    setTimeout(function () {
        GM_download(images[value].src, `${document.querySelector(CST_CLASS_TITLE).firstElementChild.innerText}_${++value}`);
        if (value < images.length) downloadImages(value);
    }, .5 * 1000);
}


// **************************************************
// **********    P R O G R E S S   B A R   **********
// **************************************************
// https://webdesign.tutsplus.com/tutorials/reading-progress-bar-css-javascript--cms-36635
let processScroll = () => {
    let docElem = document.documentElement,
        docBody = document.body,
        scrollTop = docElem.scrollTop || docBody.scrollTop,
        scrollBottom = (docElem.scrollHeight || docBody.scrollHeight) - window.innerHeight,
        scrollPercent = scrollTop / scrollBottom * 100 + '%';
    document.getElementById("my_progress_bar").style.setProperty("--scrollAmount", scrollPercent);
    document.getElementById("my_progress_bar").innerHTML = Math.round(scrollTop / scrollBottom * 100) + '%';
}

function addProgressBar(){
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
        background-image: linear-gradient(120deg, #7EC5C9 0%, #EF5C53 100%);
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

    document.addEventListener('scroll', processScroll);
}


// **************************************************
// **********       L I S T E N E R        **********
// **************************************************
function run() {
    // UI
    clearUI();
    // Link
    doDuplicated(); // need to be done before addMenu()
    // Menu
    addMenu();
    // Progress bar
    addProgressBar();
    // Adds
    removeAdds();
    // Images
    setReload();
    setGrayscale();
    doSetMargin();
    setMaxWidth(maxWidth);
}
run();

window.onscroll = function () {
    autoNext();
    prerender();
};

// Shortcuts ←/A/Q (previous), →/D (next), ↑/W/Z (scroll up), ↓/S (scroll down) B (bookmark page), H (home page)
document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.code === 'MetaLeft' || event.code === 'MetaRight') {
        return;
    }
    if (event.code === 'ArrowLeft' || event.code === 'KeyA' || event.code === 'KeyQ') {
        goPrevious();
    }
    else if (event.code === 'ArrowUp' || event.code === 'KeyW' || event.code === 'KeyZ') {
        stopScrolling();
        startScrolling(-scrollValue);
    }
    else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        goNext();
    }
    else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        stopScrolling();
        startScrolling(scrollValue);
    }
    else if (event.code === 'KeyB') {
        goBookmark();
    }
    else if (event.code === 'KeyH') {
        goHome();
    }
    else if (event.code === 'KeyM') {
        goManga();
    }
    else if (event.code === 'KeyF') {
        document.querySelector('.my_search').click();
    }
    else if (event.code === 'KeyE' && event.shiftKey) {
        downloadImages();
    }
});

document.addEventListener('keyup', event => {
    if (event.code === 'ArrowUp' || event.code === 'KeyW' || event.code === 'KeyZ' || event.code === 'ArrowDown' || event.code === 'KeyS') {
        stopScrolling();
    }
});

window.addEventListener('load', function () {
    let loadTime = Date.now() - timerStart;
    console.debug('Time until everything loaded: ' + loadTime.toFixed(0).toString() + 'ms');
    document.querySelector('.load').firstElementChild.remove();
    document.querySelector('.load').textContent = loadTime.toFixed(0).toString() + 'ms';
    document.querySelector('.load').title = 'Time until everything loaded';
    if (loadTime > 1000) {
        document.querySelector('.load').style.color = 'Tomato';
    }
    else if (loadTime > 200) {
        document.querySelector('.load').style.color = 'PaleGoldenRod';
    }
    else {
        document.querySelector('.load').style.color = 'PaleGreen';
    }

    // Adds dieeeeeee
    removeAdds();
});
