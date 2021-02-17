// ==UserScript==
// @name          Manganelo Tweaks (Chapter)
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Auto next, Export, Reloading on error, Margin, Prerender, Removes Add div, Scrolling, Shortcuts ←/A/Q (previous), →/D (previous), ↑/W/Z (scroll up), ↓/S (scroll down) B (bookmark page), H (home page)
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.0

// @homepageURL   https://github.com/kevingrillet
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @updateURL     https://github.com/kevingrillet/Userscripts/raw/main/Manganelo%20Tweaks%20(Bookmark).user.js
// @updateURL     https://github.com/kevingrillet/Userscripts/raw/main/Manganelo%20Tweaks%20(Bookmark).user.js

// @match         *://manganelo.com/chapter/*/*
// @require       https://use.fontawesome.com/releases/v5.15.2/js/all.js
// @run-at        document-end
// ==/UserScript==

// Can be edited
var autoNextSpeed = .5 * 1000, // .5 s
    autoNextBookmarkSpeed = 1 * 1000, // +1 s
    imagesMargin = 0, // px
    maxWidth = document.body.offsetWidth > 1280 ? 80 : 90, // %
    rel = 'prerender', // prerender/prefetch
    scrollSpeed = 1000 / 60, // 1/60 s
    scrollValue = 128, // px
    zoomW = 5, // % zoom delta
    env = [
        {
            name: 'Manganelo', // Name
            match: '^.*:\/\/manganelo.com\/chapter\/.*\/.*', // Match needed to know we are here
            url_home: 'https://manganelo.com/', // Url to homepage
            url_bookmark: 'bookmark', // page needed after url_home to go to bookmark
            class_breadcrumb: 'panel-breadcrumb', // class to find breadcrumb
            class_btn_next: 'navi-change-chapter-btn-next a-h', // class to find the button next
            class_btn_previous: 'navi-change-chapter-btn-prev a-h', // class to find the button previous
            class_change_chapter: 'navi-change-chapter', // class to find the combo chapter
            class_info: 'panel-chapter-info-top', // class to find the chapter name / title for the not working export
            class_img: 'container-chapter-reader', // class to find the pages (images)
            class_margin: 'server-cbb-content-margin' // // class to find the combo margin
        }
    ];

// Env consts.
var CST_HOME = null,
    CST_BOOKMARK = null,
    CST_BREADCRUMB = null,
    CST_CLASS_BTN_NEXT = null,
    CST_CLASS_BTN_PREVIOUS = null,
    CST_CLASS_CHANGE_CHAPTER = null,
    CST_CLASS_INFO = null,
    CST_CLASS_IMG = null,
    CST_CLASS_MARGIN = null;

env.some(function(e){
    if (e.match && new RegExp(e.match, 'i').test(window.location.href)) {
        CST_HOME = e.url_home;
        CST_BOOKMARK = e.url_bookmark;
        CST_BREADCRUMB = e.class_breadcrumb;
        CST_CLASS_BTN_NEXT = e.class_btn_next;
        CST_CLASS_BTN_PREVIOUS = e.class_btn_previous;
        CST_CLASS_CHANGE_CHAPTER = e.class_change_chapter;
        CST_CLASS_INFO = e.class_info;
        CST_CLASS_IMG = e.class_img;
        CST_CLASS_MARGIN = e.class_margin;
    }
});

// Vars
var buttonNext = document.getElementsByClassName(CST_CLASS_BTN_NEXT)[0],
    buttonPrevious = document.getElementsByClassName(CST_CLASS_BTN_PREVIOUS)[0],
    chapterMax = Number(document.getElementsByClassName(CST_CLASS_CHANGE_CHAPTER)[0].options[0].getAttribute('data-c')),
    chapterCurrent = Number(document.getElementsByClassName(CST_CLASS_CHANGE_CHAPTER)[0].selectedOptions[0].getAttribute('data-c')),
    head = document.getElementsByTagName('head')[0],
    images = document.getElementsByClassName(CST_CLASS_IMG)[0].getElementsByTagName('img'),
    timerStart = Date.now(),
    title = document.getElementsByClassName(CST_CLASS_INFO)[0].firstElementChild.textContent,
    scroll = null;

// Menu
function addStyles(css) {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

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

var elDiv = document.createElement('div');
elDiv.id = 'my_footer';
elDiv.innerHTML = `
  <p class="chap" title="${chapterCurrent.toString() + " / " + chapterMax.toString()}">${(chapterMax - chapterCurrent).toFixed(0).toString()}</p>
  <span>
    <a href="${document.getElementsByClassName(CST_BREADCRUMB)[0].getElementsByTagName('a')[1].href}" title="Manga (M)" ><i class="fas fa-fw fa-book" ></i></a>
  </span>
  </br>
  <span class="home">
    <a href="${CST_HOME}" title="Homepage (H)"><i class="fas fa-fw fa-home" ></i></a>
  </span>
  <span class="bookmark">
    <a href="${CST_HOME + CST_BOOKMARK}" title="Bookmark (B)"><i class="fas fa-fw fa-bell" ></i></a>
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
document.body.append(elDiv);

if (chapterMax - chapterCurrent == 0) {
    document.getElementsByClassName('chap')[0].style.color = 'PaleGreen';
}
document.getElementsByClassName('goUp')[0].onclick = function() { window.scrollBy({top: 5 * -scrollValue,left: 0, behavior: 'smooth'}); };
document.getElementsByClassName('goDown')[0].onclick = function() { window.scrollBy({top: 5 * scrollValue,left: 0, behavior: 'smooth'}); };
document.getElementsByClassName('unzoom')[0].onclick = function() { unzoom(); };
document.getElementsByClassName('zoom')[0].onclick = function() { zoom(); };
if (buttonPrevious){
    document.getElementsByClassName('goPrevious')[0].firstElementChild.href = buttonPrevious.href;
    document.getElementsByClassName('goPrevious')[0].firstElementChild.title = document.getElementsByClassName(CST_CLASS_CHANGE_CHAPTER)[0].options[document.getElementsByClassName(CST_CLASS_CHANGE_CHAPTER)[0].selectedIndex + 1].value + ' (←/A/Q)';
}
else {
    document.getElementsByClassName('goPrevious')[0].style.color = 'Tomato';
}
if (buttonNext){
    document.getElementsByClassName('goNext')[0].firstElementChild.href = buttonNext.href;
    document.getElementsByClassName('goNext')[0].firstElementChild.title = document.getElementsByClassName(CST_CLASS_CHANGE_CHAPTER)[0].options[document.getElementsByClassName(CST_CLASS_CHANGE_CHAPTER)[0].selectedIndex - 1].value + ' (→/D)';
}
else {
    document.getElementsByClassName('goNext')[0].style.color = 'Tomato';
}

// Scroll things, Auto next & Prerender
window.onscroll = function(ev) {
    // Auto next when scroll to the bottom
    if (Math.round(window.innerHeight + window.scrollY) >= document.body.offsetHeight * .99) {
        setTimeout(function() {
            if (Math.round(window.innerHeight + window.scrollY) >= document.body.offsetHeight * .99) {
                if (buttonNext !== undefined) {
                    goNext();
                }
                else {
                    setTimeout(function() {
                        window.location.replace(CST_HOME + CST_BOOKMARK);
                    }, autoNextBookmarkSpeed); // wait 4 secs
                }
            }
        }, autoNextSpeed); // wait 1 secs
    }
    // Prerender
    if (buttonNext !== undefined) {
        if (buttonNext.rel == 'nofollow') {
            if (Math.round(window.innerHeight + window.scrollY) >= document.body.offsetHeight * .75) {
                let link = document.createElement('link');
                link.setAttribute('rel', rel);
                link.setAttribute('href', buttonNext.href);
                head.appendChild(link);
                buttonNext.setAttribute('rel', rel);
            }
        }
    }
};

// Reloading on errors
function reloadImage(pThis){
    if ( pThis && pThis.src) {
        pThis.setAttribute('try', pThis.hasAttribute('try') ? Number(pThis.getAttribute('try')) + 1 : 1);
        if (Number(pThis.getAttribute('try')) > 5) {
            console.error('Failed to load: ' + pThis.src);
            pThis.removeAttribute('onerror');
        } else {
            console.warn('Failed to load (' + pThis.getAttribute('try') + '): ' + pThis.src);
            pThis.src = pThis.src;
        }
    }
};

var script = document.createElement('script');
script.appendChild(document.createTextNode(reloadImage));
head.appendChild(script);

function setReload() {
    for (let i of images) {
        if ( i && i.src) {
            i.setAttribute('onerror','reloadImage(this);');
        }
    };
}
setReload();

// Margins
if (document.getElementsByClassName(CST_CLASS_MARGIN)[0].selectedIndex !== imagesMargin) {
    if (imagesMargin >= 0 && imagesMargin <= 10) {
        document.getElementsByClassName(CST_CLASS_MARGIN)[0].selectedIndex = imagesMargin;
    }
    function setMargin(value) {
        for (let i of images) {
            i.style.marginTop = value + 'px';
        };
    };
    setMargin(imagesMargin);
}

// Max Width
function setMaxWidth(value) {
    if (value <= 10) {
        document.getElementsByClassName('unzoom')[0].onclick = null;
        document.getElementsByClassName('unzoom')[0].style.color = 'Tomato';
        document.getElementsByClassName('unzoom')[0].title = 'Min';
    } else {
        document.getElementsByClassName('unzoom')[0].onclick = function() { unzoom(); };
        document.getElementsByClassName('unzoom')[0].style.color = 'GhostWhite';
        document.getElementsByClassName('unzoom')[0].title = (value - zoomW).toString() + '%';
    }
    if (value >= 100) {
        document.getElementsByClassName('zoom')[0].onclick = null;
        document.getElementsByClassName('zoom')[0].style.color = 'Tomato';
        document.getElementsByClassName('zoom')[0].title = 'Max';
    } else {
        document.getElementsByClassName('zoom')[0].onclick = function() { zoom(); };
        document.getElementsByClassName('zoom')[0].title = (value + zoomW).toString() + '%';
        document.getElementsByClassName('zoom')[0].style.color = 'GhostWhite';
    }
    for (let i of images) {
        i.style.maxWidth = value + '%';
    };
}
setMaxWidth(maxWidth);

function zoom() {
    maxWidth += zoomW;
    setMaxWidth(maxWidth);
};
function unzoom() {
    maxWidth -= zoomW;
    setMaxWidth(maxWidth);
};

// Removes Add divs
document.querySelectorAll('iframe').forEach((i)=>{i.parentNode.remove()});

// Scrolling
function startScrolling(value){
    scroll = setInterval(function() {
        window.scrollBy(0, value);
    }, scrollSpeed)
}
function stopScrolling(){
    clearInterval(scroll);
    scroll = null;
}

// Shortcuts ←/A/Q (previous), →/D (next), ↑/W/Z (scroll up), ↓/S (scroll down) B (bookmark page), H (home page)
function goNext(){
    buttonNext.click();
};
function goPrevious(){
    buttonPrevious.click();
};

document.addEventListener('keydown', event => {
    if (event.code == 'ArrowLeft' || event.code == 'KeyA' || event.code == 'KeyQ') {
        goPrevious();
    }
    else if (event.code == 'ArrowUp' || event.code == 'KeyW' || event.code == 'KeyZ') {
        stopScrolling();
        startScrolling(-scrollValue);
    }
    else if (event.code == 'ArrowRight' || event.code == 'KeyD') {
        goNext();
    }
    else if (event.code == 'ArrowDown' || event.code == 'KeyS') {
        stopScrolling();
        startScrolling(scrollValue);
    }
    else if (event.code == 'KeyB') {
        window.location.replace(CST_HOME + CST_BOOKMARK);
    }
    else if (event.code == 'KeyH') {
        window.location.replace(CST_HOME);
    }
    else if (event.code == 'KeyM') {
        window.location.replace(document.getElementsByClassName(CST_BREADCRUMB)[0].getElementsByTagName('a')[1].href);
    }
    else if (event.code == 'KeyE') {
    }
});

document.addEventListener('keyup', event => {
    if (event.code == 'ArrowUp' || event.code == 'KeyW' || event.code == 'KeyZ' || event.code == 'ArrowDown' || event.code == 'KeyS' ) {
        stopScrolling();
    }
});

window.addEventListener('load', function () {
    let loadTime = Date.now()-timerStart;
    document.getElementsByClassName('load')[0].firstElementChild.remove();
    document.getElementsByClassName('load')[0].textContent = loadTime.toFixed(0).toString() + 'ms';
    document.getElementsByClassName('load')[0].title = 'Time until everything loaded';
    if (loadTime > 1000) {
        document.getElementsByClassName('load')[0].style.color = 'Tomato';
    }
    else if (loadTime > 200) {
        document.getElementsByClassName('load')[0].style.color = 'PaleGoldenRod';
    }
    else {
        document.getElementsByClassName('load')[0].style.color = 'PaleGreen';
    }
});
