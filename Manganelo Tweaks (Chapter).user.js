// ==UserScript==
// @name          Manganelo Tweaks (Chapter)
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Auto next, Duplicate chapter, Export, Reloading on error, Margin, Prerender, Removes Add div, Scrolling, Shortcuts ←/A/Q (previous), →/D (previous), ↑/W/Z (scroll up), ↓/S (scroll down) B (bookmark page), H (home page)
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.11

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://github.com/kevingrillet/Userscripts/raw/main/Manganelo%20Tweaks%20(Chapter).user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Manganelo%20Tweaks%20(Chapter).user.js

// @match         *://manganelo.com/chapter/*/*
// @grant         GM_download
// @require       https://use.fontawesome.com/releases/v5.15.2/js/all.js
// @run-at        document-end
// ==/UserScript==


// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var autoNextSpeed = .5 * 1000, // .5 s
    autoNextBookmarkSpeed = 1 * 1000, // +1 s
    imagesMargin = 0, // px
    maxWidth = document.body.offsetWidth > 1280 ? 80 : 90, // %
    rel = 'prerender', // prerender/prefetch
    relOnLoad = true, // does rel is added on scroll or on load
    scrollSpeed = 1000 / 60, // 1/60 s
    scrollValue = 48, // px
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
            class_img: 'container-chapter-reader', // class to find the pages (images)
            class_margin: 'server-cbb-content-margin', // class to find the combo margin
            class_title: 'panel-chapter-info-top' // class to find the title for google search
        }
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
    CST_CLASS_MARGIN = null,
    CST_CLASS_TITLE = null;

env.some(function(e){
    if (e.match && new RegExp(e.match, 'i').test(window.location.href)) {
        CST_HOME = e.url_home;
        CST_BOOKMARK = e.url_bookmark;
        CST_CLASS_BREADCRUMB = '.' + e.class_breadcrumb.replace(' ', '.');
        CST_CLASS_BTN_NEXT = '.' + e.class_btn_next.replace(' ', '.');
        CST_CLASS_BTN_PREVIOUS = '.' + e.class_btn_previous.replace(' ', '.');
        CST_CLASS_CHANGE_CHAPTER = '.' + e.class_change_chapter.replace(' ', '.');
        CST_CLASS_IMG = '.' + e.class_img.replace(' ', '.');
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
    timerStart = Date.now(),
    scroll = null;


// **************************************************
// **********     D U P L I C A T E D      **********
// **************************************************
if ((buttonNext ? buttonNext.href : null) == window.location.href) {
    console.warn('Duplicated chapter :(');
    // If the button next Exists & in the combo there is a Selected-2 element, there is a next chapter :)
    let tmp = document.querySelector(CST_CLASS_CHANGE_CHAPTER).options[document.querySelector(CST_CLASS_CHANGE_CHAPTER).selectedIndex - 2];
    if (buttonNext && tmp) {
        buttonNext.href = buttonNext.href.replace(/\d+(?:\.\d+)?$/, tmp.getAttribute('data-c'));
    }
}


// **************************************************
// **********           M E N U            **********
// **************************************************
// require: https://use.fontawesome.com/releases/v5.15.2/js/all.js
function addStyles(css) {
    var style = head.appendChild(document.createElement('style'));
    style.type = 'text/css';
    style.innerHTML = css;
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

var elDiv = document.body.appendChild(document.createElement('div'));
elDiv.id = 'my_footer';
elDiv.innerHTML = `
  <p class="chap" title="${chapterCurrent.toString() + " / " + chapterMax.toString()}">${(chapterMax - chapterCurrent).toFixed(0).toString()}</p>
  <span class="export" title="Export (E)">
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
    <a class="goBookmark" href="${CST_HOME + CST_BOOKMARK}" title="Bookmark (B)"><i class="fas fa-fw fa-bell" ></i></a>
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


// **************************************************
// **********       O N   C L I C K        **********
// **************************************************
if (chapterMax - chapterCurrent == 0) {
    document.querySelector('.chap').style.color = 'PaleGreen';
}
document.querySelector('.export').onclick = function() { downloadImages(); };
document.querySelector('.goUp').onclick = function() { window.scrollBy({top: 5 * -scrollValue,left: 0, behavior: 'smooth'}); };
document.querySelector('.goDown').onclick = function() { window.scrollBy({top: 5 * scrollValue,left: 0, behavior: 'smooth'}); };
document.querySelector('.unzoom').onclick = function() { unzoom(); };
document.querySelector('.zoom').onclick = function() { zoom(); };
if (buttonPrevious){
    document.querySelector('.goPrevious').firstElementChild.href = buttonPrevious.href;
    document.querySelector('.goPrevious').firstElementChild.title = document.querySelector(CST_CLASS_CHANGE_CHAPTER).options[document.querySelector(CST_CLASS_CHANGE_CHAPTER).selectedIndex + 1].value + ' (←/A/Q)';
}
else {
    document.querySelector('.goPrevious').style.color = 'Tomato';
}
if (buttonNext){
    document.querySelector('.goNext').firstElementChild.href = buttonNext.href;
    document.querySelector('.goNext').firstElementChild.title = document.querySelector(CST_CLASS_CHANGE_CHAPTER).options[document.querySelector(CST_CLASS_CHANGE_CHAPTER).selectedIndex - 1].value + ' (→/D)';
}
else {
    document.querySelector('.goNext').style.color = 'Tomato';
}


// **************************************************
// **********           A D D S            **********
// **************************************************
document.querySelectorAll('iframe').forEach((i)=>{i.parentNode.style.display = "none"});
//document.querySelectorAll('iframe').forEach((i)=>{i.parentNode.remove()});



// **************************************************
// **********      A U T O   N E X T       **********
// **************************************************
function autoNext(){
    // Auto next when scroll to the bottom
    if (Math.round(window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
        setTimeout(function() {
            if (Math.round(window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
                if (buttonNext && buttonNext !== undefined) {
                    goNext();
                }
                else {
                    setTimeout(function() {
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
function prerender(){
    if (buttonNext && buttonNext !== undefined) {
        if (buttonNext.rel == 'nofollow') {
            if (Math.round(window.innerHeight + window.scrollY) >= document.body.offsetHeight * .75) {
                let link = head.appendChild(document.createElement('link'));
                link.setAttribute('rel', rel);
                link.setAttribute('href', buttonNext.href);
                buttonNext.setAttribute('rel', rel);
            }
        }
    }
}


// **************************************************
// **********         R E L O A D          **********
// **************************************************
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

var script = head.appendChild(document.createElement('script'));
script.appendChild(document.createTextNode(reloadImage));

function setReload() {
    for (let i of images) {
        if ( i && i.src) {
            i.setAttribute('onerror','reloadImage(this);');
        }
    };
}
setReload();


// **************************************************
// **********      G R A Y S C A L E       **********
// **************************************************
function toogleGrayscale(pThis) {
    if ( pThis && pThis.src) {
        if (pThis.style.filter) {
            pThis.style.removeProperty('filter');
        } else {
            pThis.style.filter = "grayscale(1)";
        }
    }
};

script = head.appendChild(document.createElement('script'));
script.appendChild(document.createTextNode(toogleGrayscale));

function setGrayscale() {
    for (let i of images) {
        if ( i && i.src) {
            i.setAttribute('onclick','toogleGrayscale(this);');
        }
    };
}
setGrayscale();


// **************************************************
// **********         M A R G I N          **********
// **************************************************
function setMargin(value) {
    for (let i of images) {
        i.style.marginTop = value + 'px';
    };
};
if (document.querySelector(CST_CLASS_MARGIN).selectedIndex !== imagesMargin) {
    if (imagesMargin >= 0 && imagesMargin <= 10) {
        document.querySelector(CST_CLASS_MARGIN).selectedIndex = imagesMargin;
    }
    setMargin(imagesMargin);
}


// **************************************************
// **********      M A X   W I D T H       **********
// **************************************************
function setMaxWidth(value) {
    if (value <= 10) {
        document.querySelector('.unzoom').onclick = null;
        document.querySelector('.unzoom').style.color = 'Tomato';
        document.querySelector('.unzoom').title = 'Min';
    } else {
        document.querySelector('.unzoom').onclick = function() { unzoom(); };
        document.querySelector('.unzoom').style.color = 'GhostWhite';
        document.querySelector('.unzoom').title = (value - zoomW).toString() + '%';
    }
    if (value >= 100) {
        document.querySelector('.zoom').onclick = null;
        document.querySelector('.zoom').style.color = 'Tomato';
        document.querySelector('.zoom').title = 'Max';
    } else {
        document.querySelector('.zoom').onclick = function() { zoom(); };
        document.querySelector('.zoom').title = (value + zoomW).toString() + '%';
        document.querySelector('.zoom').style.color = 'GhostWhite';
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


// **************************************************
// **********      S C R O L L I N G       **********
// **************************************************
function startScrolling(value){
    scroll = setInterval(function() {
        window.scrollBy(0, value);
    }, scrollSpeed)
}
function stopScrolling(){
    clearInterval(scroll);
    scroll = null;
}


// **************************************************
// **********     N A V I G A T I O N      **********
// **************************************************
function goBookmark(){
    //window.location.assign(CST_HOME + CST_BOOKMARK);
    document.querySelector('.goBookmark').click();
};
function goHome() {
    //window.location.assign(CST_HOME);
    document.querySelector('.goHome').click();
};
function goManga() {
    //window.location.assign(document.querySelectorAll(`:scope ${CST_CLASS_BREADCRUMB} a`)[1].href);
    document.querySelector('.goManga').click();
};
function goNext(){
    if (buttonNext) {
        //window.location.assign(buttonNext.href);
        document.querySelector('.goNext').firstElementChild.click();
    }
};
function goPrevious(){
    if (buttonPrevious) {
        //window.location.assign(buttonPrevious.href);
        document.querySelector('.goPrevious').firstElementChild.click();
    }
};


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
    setTimeout(function() {
        GM_download(images[value].src, `${document.querySelector(CST_CLASS_TITLE).firstElementChild.innerText}_${++value}`);
        if (value < images.length) downloadImages(value);
    }, .5 * 1000);
}


// **************************************************
// **********       L I S T E N E R        **********
// **************************************************
window.onscroll = function(ev) {
    autoNext();
    prerender();
};

// Shortcuts ←/A/Q (previous), →/D (next), ↑/W/Z (scroll up), ↓/S (scroll down) B (bookmark page), H (home page)
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
        goBookmark();
    }
    else if (event.code == 'KeyH') {
        goHome();
    }
    else if (event.code == 'KeyM') {
        goManga();
    }
    else if (event.code == 'KeyF') {
        document.querySelector('.my_search').click();
    }
    else if (event.code == 'KeyE') {
        downloadImages();
    }
});

document.addEventListener('keyup', event => {
    if (event.code == 'ArrowUp' || event.code == 'KeyW' || event.code == 'KeyZ' || event.code == 'ArrowDown' || event.code == 'KeyS' ) {
        stopScrolling();
    }
});

window.addEventListener('load', function () {
    let loadTime = Date.now()-timerStart;
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

    if (relOnLoad) {
        prerender();
    }
});
