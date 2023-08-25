// ==UserScript==
// @name          [Manganelo] Tweaks (Bookmark)
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Export Bookmark, repair user-notification, ...
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.26

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Manganelo]%20Tweaks%20(Bookmark).user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Manganelo]%20Tweaks%20(Bookmark).user.js

// @match         *://manganelo.com/bookmark*
// @match         *://manganato.com/bookmark*
// @match         *://m.manganelo.com/bookmark*
// @icon          https://www.google.com/s2/favicons?domain=manganato.com
// @grant         GM_deleteValue
// @grant         GM_download
// @grant         GM_getValue
// @grant         GM_info
// @grant         GM_listValues
// @grant         GM_setValue
// @require       https://use.fontawesome.com/releases/v5.15.2/js/all.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.4/FileSaver.min.js
// @run-at        document-end
// ==/UserScript==

'use strict';

// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var moveContainerRight = true, // Move MOST POPULAR MANGA & MANGA BY GENRES to bottom
    moveContainerTop = true, // Move top to bottom, need right to be active
    hideCrap = true, // Hide Top, Right, Bottom Containers
    // downloadedChaptersAsRead = false, // downloadChapter will open every chapter so they will be marked as read...
    forceRefresh = false, // IDK if we can be ban for this, it will ask so many requests...
    scrollSpeed = 1000 / 60, // 1/60 s
    scrollValue = 48, // px
    showAdult = true, // Sometimes false positive...
    showHype = true,
    showRank = true,
    showToRead = true,
    env = [
        {
            name: 'Manganelo', // Name
            match: '^.*://manganelo.com/bookmark.*', // Match needed to know we are here
            chapter_url: 'chapter_', // to remove chapter from link to do proper count
            chapter_url_split_chapter: '5', // position in the href
            chapter_url_split_manga: '4', // position in the href
            class_blue: 'page-blue', // class to find active page
            class_bookmark: 'bookmark-item', // class bookmark
            class_bookmark_panel: 'panel-bookmark', // class contain all bookmarks
            class_btn: 'panel-breadcrumb', // class to add icon
            class_container_left: 'container-main-left', // class container bookmark
            class_container_right: 'container-main-right', // class container popular / by genre
            // class_img: 'img-loading', // class to get image cover
            // class_chapter_img: 'container-chapter-reader', // class to find the pages on chapter page
            // class_chapter_title: 'panel-chapter-info-top', // class to find the title on chapter page
            class_manga_adult: 'panel-story-info', // to find adult tag on manga page
            // class_manga_change_chapter: 'navi-change-chapter', // class to find the combo chapter
            // class_manga_chapter: 'chapter-name', // to find chapter on manga page
            class_manga_hype: 'info-image', // to find hype on manga page
            class_name: 'item-story-name', // class manga title
            class_page: 'group-page', // class div pages
            class_search: 'search-story', // class search bar
            class_slider: 'container container-silder', // class containing the top slider
            class_title: 'item-title', // class for Viewed / Current row
            // class_user_notif: 'user-notification', // class to copy number of notifs from home page
            full_manga_url: 'https://manganelo.com/manga/', // to complete
            tag_manga_rank: '[property="v:average"]', // to find rate on manga page
        },
        {
            name: 'Manganato', // Name
            match: '^.*://manganato.com/bookmark.*', // Match needed to know we are here
            chapter_url: 'chapter-', // to remove chapter from link to do proper count
            chapter_url_split_chapter: '4', // position in the href
            chapter_url_split_manga: '3', // position in the href
            class_blue: 'page-blue', // class to find active page
            class_bookmark: 'user-bookmark-item', // class bookmark
            class_bookmark_panel: 'user-bookmark-content', // class contain all bookmarks
            class_btn: 'panel-breadcrumb', // class to add icon
            class_container_left: 'container-main-left', // class container bookmark
            class_container_right: 'container-main-right', // class container popular / by genre
            // class_img: 'img-loading', // class to get image cover
            // class_chapter_img: 'container-chapter-reader', // class to find the pages on chapter page
            // class_chapter_title: 'panel-chapter-info-top', // class to find the title on chapter page
            class_manga_adult: 'variations-tableInfo', // to find adult tag on manga page
            // class_manga_change_chapter: 'navi-change-chapter', // class to find the combo chapter
            // class_manga_chapter: 'chapter-name', // to find chapter on manga page
            class_manga_hype: 'info-image', // to find hype on manga page
            class_name: 'bm-title', // class manga title
            class_page: 'group-page', // class div pages
            class_search: 'search-story', // class search bar
            class_slider: 'container container-silder', // class containing the top slider
            class_title: 'user-bookmark-item-right', // class for Viewed / Current row
            // class_user_notif: 'user-notification', // class to copy number of notifs from home page
            full_manga_url: 'https://manganato.com/', // to complete
            tag_manga_rank: '[property="v:average"]', // to find rate on manga page
        },
        {
            name: 'M.Manganelo', // Name
            match: '^.*://m.manganelo.com/bookmark.*', // Match needed to know we are here
            chapter_url: 'chapter-', // to remove chapter from link to do proper count
            chapter_url_split_chapter: '4', // position in the href
            chapter_url_split_manga: '3', // position in the href
            class_blue: 'page-blue', // class to find active page
            class_bookmark: 'user-bookmark-item', // class bookmark
            class_bookmark_panel: 'user-bookmark-content', // class contain all bookmarks
            class_btn: 'panel-breadcrumb', // class to add icon
            class_container_left: 'container-main-left', // class container bookmark
            class_container_right: 'container-main-right', // class container popular / by genre
            // class_img: 'img-loading', // class to get image cover
            // class_chapter_img: 'container-chapter-reader', // class to find the pages on chapter page
            // class_chapter_title: 'panel-chapter-info-top', // class to find the title on chapter page
            class_manga_adult: 'variations-tableInfo', // to find adult tag on manga page
            // class_manga_change_chapter: 'navi-change-chapter', // class to find the combo chapter
            // class_manga_chapter: 'chapter-name', // to find chapter on manga page
            class_manga_hype: 'info-image', // to find hype on manga page
            class_name: 'bm-title', // class manga title
            class_page: 'group-page', // class div pages
            class_search: 'search-story', // class search bar
            class_slider: 'container container-silder', // class containing the top slider
            class_title: 'user-bookmark-item-right', // class for Viewed / Current row
            // class_user_notif: 'user-notification', // class to copy number of notifs from home page
            full_manga_url: 'https://m.manganelo.com/', // to complete
            tag_manga_rank: '[property="v:average"]', // to find rate on manga page
        },
    ];

// **************************************************
// **********      V A R I A B L E S       **********
// **************************************************
var CST_APP_VERSION = GM_info.script.version,
    CST_NAME = null,
    CST_CHAPTER_URL = null,
    CST_CHAPTER_URL_SPLIT_CHAPTER = null,
    CST_CHAPTER_URL_SPLIT_MANGA = null,
    CST_CLASS_BLUE = null,
    CST_CLASS_BOOKMARK = null,
    CST_CLASS_BOOKMARK_PANEL = null,
    CST_CLASS_BTN = null,
    CST_CLASS_CONTAINER_LEFT = null,
    CST_CLASS_CONTAINER_RIGHT = null,
    // CST_CLASS_IMG = null,
    // CST_CLASS_CHAPTER_IMG = null,
    // CST_CLASS_CHAPTER_TITLE = null,
    CST_CLASS_MANGA_ADULT = null,
    // CST_CLASS_MANGA_CHANGE_CHAPTER = null,
    // CST_CLASS_MANGA_CHAPTER = null,
    CST_CLASS_MANGA_HYPE = null,
    CST_CLASS_NAME = null,
    CST_CLASS_PAGE = null,
    CST_CLASS_SEARCH = null,
    CST_CLASS_SLIDER = null,
    CST_CLASS_TITLE = null,
    // CST_CLASS_USER_NOTIF = null,
    CST_FULL_MANGA_URL = null,
    CST_TAG_MANGA_RANK = null;

env.some(function (e) {
    if (e.match && new RegExp(e.match, 'i').test(window.location.href)) {
        CST_NAME = e.name;
        CST_CHAPTER_URL = e.chapter_url;
        CST_CHAPTER_URL_SPLIT_CHAPTER = e.chapter_url_split_chapter;
        CST_CHAPTER_URL_SPLIT_MANGA = e.chapter_url_split_manga;
        CST_CLASS_BLUE = '.' + e.class_blue.replace(' ', '.');
        CST_CLASS_BOOKMARK = '.' + e.class_bookmark.replace(' ', '.');
        CST_CLASS_BOOKMARK_PANEL = '.' + e.class_bookmark_panel.replace(' ', '.');
        CST_CLASS_BTN = '.' + e.class_btn.replace(' ', '.');
        CST_CLASS_CONTAINER_LEFT = '.' + e.class_container_left.replace(' ', '.');
        CST_CLASS_CONTAINER_RIGHT = '.' + e.class_container_right.replace(' ', '.');
        // CST_CLASS_IMG = '.' + e.class_img.replace(' ', '.');
        // CST_CLASS_CHAPTER_IMG = '.' + e.class_chapter_img.replace(' ', '.');
        // CST_CLASS_CHAPTER_TITLE = '.' + e.class_chapter_title.replace(' ', '.');
        CST_CLASS_MANGA_ADULT = '.' + e.class_manga_adult.replace(' ', '.');
        // CST_CLASS_MANGA_CHANGE_CHAPTER = '.' + e.class_manga_change_chapter.replace(' ', '.');
        // CST_CLASS_MANGA_CHAPTER = '.' + e.class_manga_chapter.replace(' ', '.');
        CST_CLASS_MANGA_HYPE = '.' + e.class_manga_hype.replace(' ', '.');
        CST_CLASS_NAME = '.' + e.class_name.replace(' ', '.') + ' a';
        CST_CLASS_PAGE = '.' + e.class_page.replace(' ', '.');
        CST_CLASS_SEARCH = '.' + e.class_search.replace(' ', '.');
        CST_CLASS_SLIDER = '.' + e.class_slider.replace(' ', '.');
        CST_CLASS_TITLE = '.' + e.class_title.replace(' ', '.') + ' span';
        // CST_CLASS_USER_NOTIF = '.' + e.class_user_notif.replace(' ', '.');
        CST_FULL_MANGA_URL = e.full_manga_url;
        CST_TAG_MANGA_RANK = e.tag_manga_rank;
    }
});

var domain = window.location.hostname,
    head = document.head,
    pageCount = Number(document.querySelector(CST_CLASS_PAGE)?.lastElementChild.text.replace(/\D+/g, '')),
    // eslint-disable-next-line no-unused-vars
    scrollInterval,
    // sortStyleInjected = false,
    timerStart = Date.now();

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
    #my_export { float: right; }
    #my_export span { cursor: pointer; font-size: 1em; color: GhostWhite; }
    `);

    let elDiv = document.querySelector(CST_CLASS_BTN).appendChild(document.createElement('div'));
    elDiv.id = 'my_export';
    if (['manganato.com', 'manganelo.com'].includes(domain)) {
        elDiv.innerHTML += `
        <span class="export" title="Export (Shift + E)">
            <a><i class="fas fa-fw fa-file-download" ></i></a>
        </span>
        `;
    }
    elDiv.innerHTML += `
    <span class="sort" title="Sort (Shift + S)">
        <a><i class="fas fa-fw fa-sort" ></i></a>
    </span>`;
    elDiv.innerHTML += `
    <span class="refresh" title="Refresh tags (Shift + T)">
        <a><i class="fas fa-fw fa-redo" ></i></a>
    </span>`;
    elDiv.innerHTML += `
    <span class="delete" title="Delete cache (Delete)">
        <a><i class="fas fa-fw fa-trash" ></i></a>
    </span>
    `;

    if (document.querySelector('.export')) {
        document.querySelector('.export').onclick = function (event) {
            switch (domain) {
                case 'manganato.com':
                    exportBmManganato(!event.altKey);
                    break;
                case 'manganelo.com':
                    exportBmManganelo();
                    break;
            }
        };
    }
    document.querySelector('.sort').onclick = function () {
        letsSort();
    };
    document.querySelector('.refresh').onclick = function () {
        doForceRefresh();
    };
    document.querySelector('.delete').onclick = function () {
        deleteValues();
    };
}

function addMenuOnBookmark() {
    addStyles(`
    #my_bookmark { position: absolute; right: 10px; bottom: 10px; }
    #my_bookmark span { cursor: pointer; font-size: 1em; color: GhostWhite; }
    `);

    let bm = document.querySelectorAll(CST_CLASS_BOOKMARK);

    for (let j = 0; j < bm.length; j++) {
        if (bm[j].querySelector(CST_CLASS_NAME)) {
            let el = bm[j].appendChild(document.createElement('div'));
            el.id = 'my_bookmark';
            el.innerHTML = `
    <!--
    <span class="bookmark_download" title="Download">
        <a><i class="fas fa-fw fa-file-download" ></i></a>
    </span>
    -->
    <span class="bookmark_refresh" title="Refresh tags">
        <a><i class="fas fa-fw fa-redo" ></i></a>
    </span>
    `;

            el.querySelector('.bookmark_refresh').onclick = function () {
                doBookmarkRefresh(bm[j]);
            };
        }
    }
}

// **************************************************
// **********      S C R O L L I N G       **********
// **************************************************
function startScrolling(value) {
    scrollInterval = setInterval(function () {
        window.scrollBy(0, value);
    }, scrollSpeed);
}
function stopScrolling() {
    clearInterval(scrollInterval);
    scrollInterval = null;
}

// **************************************************
// **********         E X P O R T          **********
// **************************************************
// require: https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.4/FileSaver.min.js
function deleteTemp() {
    if (document.querySelector('#temp_data')) {
        document.querySelector('#temp_data').remove();
    }
}

function saveFile(saveData) {
    let d = new Date(),
        time =
            d.getFullYear() +
            '.' +
            ('0' + parseInt(d.getMonth() + 1)).slice(-2) +
            '.' +
            ('0' + d.getDate()).slice(-2) +
            '_' +
            ('0' + d.getHours()).slice(-2) +
            '.' +
            ('0' + d.getMinutes()).slice(-2),
        fileData = new Blob([saveData], { type: 'application/octet-stream' });

    /* global saveAs */
    saveAs(fileData, 'manga_bookmark_' + time + '.csv');
}

function getCookie(name = 'user_acc') {
    let result = false;
    const value = `; ${document.cookie}`;
    try {
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            let user = parts.pop().split(';').shift();
            if (name === 'user_acc') {
                user = JSON.parse(decodeURIComponent(user));
                result = user.user_data;
            }
        }
    } catch (e) {
        result = false;
    }

    return result;
}

async function getBMs(userCookie, currentPage = 1) {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    var urlencoded = new URLSearchParams();
    urlencoded.append('out_type', 'json');
    urlencoded.append('bm_source', 'manganato');
    urlencoded.append('bm_page', currentPage);
    urlencoded.append('user_data', userCookie);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow',
    };

    return await fetch('https://user.mngusr.com/bookmark_get_list_full', requestOptions)
        .then((response) => response.json())
        .then((result) => result)
        .catch((error) => console.log('ExportError', error));
}

async function exportBmManganato(bExport = true) {
    let userData = getCookie(),
        toSave = `${domain} Bookmark; ToRead; TitleViewed; TitleCurrent; LinkViewed\n`;

    if (userData) {
        $(this).html('Generating File...').prop('disabled', true);
        let initBMFetch = await getBMs(userData);
        pageCount = initBMFetch.bm_page_total || 0;
        if (pageCount > 0) {
            let arrayBm = [];
            for (let i = 1; i <= pageCount; i++) {
                let currPage = await getBMs(userData, i);
                let currPageBMs = currPage.data;
                for (let j = 0; j < currPageBMs.length; j++) {
                    let itemBm = {
                        Bookmark: currPageBMs[j].note_story_name,
                        ToRead:
                            currPageBMs[j].chapter_numbernow && currPageBMs[j].chapterlastnumber
                                ? parseFloat((parseFloat(currPageBMs[j].chapterlastnumber) - parseFloat(currPageBMs[j].chapter_numbernow)).toFixed(2))
                                : 'Not Found',
                        TitleViewed: currPageBMs[j].chapter_namenow,
                        TitleCurrent: currPageBMs[j].chapterlastname,
                        LastUpdate: new Date(
                            Date.parse(currPageBMs[j].chapterlastdateupdate) ? Date.parse(currPageBMs[j].chapterlastdateupdate) : Date.now()
                        ).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                        }),
                        LinkViewed: currPageBMs[j].link_chapter_now,
                    };
                    toSave += `${itemBm.Bookmark}; ${itemBm.ToRead.replace('.', ',')}; ${itemBm.TitleViewed}; ${itemBm.TitleCurrent}; ${itemBm.LinkViewed}\n`;

                    delete itemBm.TitleCurrent;
                    delete itemBm.TitleViewed;
                    arrayBm.push(itemBm);
                }
            }

            if (bExport === true) {
                saveFile(toSave);
            }

            arrayBm = arrayBm.filter((item) => item.ToRead > 0);
            arrayBm.sort((a, b) => a.ToRead - b.ToRead);
            console.table(arrayBm);
            let arrayBmSum = 0;
            arrayBm.forEach((item) => (arrayBmSum += item.ToRead));
            console.debug(`Number of mangas: ${arrayBm.length}; number of chapters: ${arrayBmSum}`);
        }
    }
}

function exportBmManganelo() {
    deleteTemp();

    let elDivTemp = document.body.appendChild(document.createElement('div'));
    elDivTemp.id = 'temp_data';

    let pageSuccess = 0,
        toSave = `${domain} Bookmark`;
    toSave += `;To Read`;
    toSave += `;Title Viewed`;
    toSave += `;Title Current`;
    toSave += `;Link Viewed`;
    toSave += `\n`;

    for (let i = 0; i < 1; i++) {
        // Prepare divs for info (useless but easier to debug)
        let elDivPage = elDivTemp.appendChild(document.createElement('div'));
        elDivPage.id = `page${i + 1}`;

        let xhr = new XMLHttpRequest();
        xhr.responseType = 'document';
        xhr.open('GET', `https://${domain}/bookmark?page=${i + 1}`);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            // Let's add info into the pages div
            if (xhr.status >= 200 && xhr.status < 400) {
                console.log(xhr.responseXML);
                pageSuccess++;
                let resp = xhr.responseXML,
                    p = resp.querySelectorAll(`:scope ${CST_CLASS_PAGE} ${CST_CLASS_BLUE}`)[1].text; // 0 is first, 1 is current, 2 is last
                document.querySelector(`#page${p}`).innerHTML = resp.querySelector(CST_CLASS_BOOKMARK_PANEL).innerHTML;

                // Last page is load, let's save
                if (pageSuccess === pageCount) {
                    let bm = document.querySelectorAll(`:scope #temp_data ${CST_CLASS_BOOKMARK}`);
                    for (let j = 0; j < bm.length; j++) {
                        let bookmarkTitle = bm[j].querySelector(CST_CLASS_NAME);
                        if (bookmarkTitle) {
                            let lastViewed = bm[j].querySelector(CST_CLASS_TITLE) ? bm[j].querySelector(`:scope ${CST_CLASS_TITLE} a`) : null,
                                current = bm[j].querySelectorAll(CST_CLASS_TITLE)[1] ? bm[j].querySelectorAll(CST_CLASS_TITLE)[1].querySelector('a') : null;

                            toSave += bookmarkTitle.text;
                            toSave += `;${
                                lastViewed && current
                                    ? (
                                          current.href.split('/')[CST_CHAPTER_URL_SPLIT_CHAPTER].replace(CST_CHAPTER_URL, '') -
                                          lastViewed.href.split('/')[CST_CHAPTER_URL_SPLIT_CHAPTER].replace(CST_CHAPTER_URL, '')
                                      )
                                          .toFixed(2)
                                          .replace('.', ',')
                                    : 'Not Found'
                            }`;
                            toSave += `;${lastViewed && current ? lastViewed.text : 'Not Found'}`;
                            toSave += `;${lastViewed && current ? current.text : 'Not Found'}`;
                            toSave += `;${lastViewed && current ? lastViewed.href : 'Not Found'}`;
                            toSave += ` \n`;
                        }
                    }
                    saveFile(toSave);
                    deleteTemp();
                }
            }
        };
        xhr.send();
    }
}

// **************************************************
// **********     M O V E   R I G H T      **********
// **************************************************
function moveRight() {
    document.querySelector(CST_CLASS_CONTAINER_LEFT).style.width = '100%';
    document.querySelector(CST_CLASS_CONTAINER_RIGHT).style.width = '100%';
    addStyles(`
.panel-topview-item {
    background-position: 10px !important;
}
.panel-topview {
    margin-top: 10px;
}
`);
    if (moveContainerTop) moveTop();
}

function moveTop() {
    document
        .querySelector(CST_CLASS_CONTAINER_LEFT)
        .parentNode.insertBefore(document.querySelector(CST_CLASS_SLIDER), document.querySelector(CST_CLASS_CONTAINER_RIGHT));
}

// **************************************************
// **********      H I D E   C R A P       **********
// **************************************************
function doHideCrap() {
    document.querySelector(CST_CLASS_CONTAINER_RIGHT).style.display = 'none';
    document.querySelector(CST_CLASS_SLIDER).style.display = 'none';
}

// **************************************************
// **********           S O R T            **********
// **************************************************
// Duplicate the default bookmark list and order it instead of creating a table.
// and instead of destroying on 2nd click, just swap between the 2.
function letsSort() {
    if (document.querySelector('#my_sort')) {
        if (document.querySelector(CST_CLASS_BOOKMARK_PANEL).style.display === 'none') {
            document.querySelector('#my_sort').style.display = 'none';
            document.querySelector(CST_CLASS_BOOKMARK_PANEL).style.display = 'block';
        } else {
            document.querySelector('#my_sort').style.display = 'block';
            document.querySelector(CST_CLASS_BOOKMARK_PANEL).style.display = 'none';
        }
        return;
    }

    let bmp = document.querySelector(CST_CLASS_BOOKMARK_PANEL),
        bmps = bmp.cloneNode(true);
    bmps.id = 'my_sort';
    bmp.after(bmps);
    bmp.style.display = 'none';

    sortTable();
}

function sortTable() {
    let table, rows, switching, i, x, y, shouldSwitch;
    table = document.querySelector('#my_sort');
    switching = true;
    while (switching) {
        switching = false;
        rows = table.querySelectorAll(CST_CLASS_BOOKMARK);
        for (i = 0; i < rows.length - 1; i++) {
            shouldSwitch = false;
            x = Number(rows[i].querySelector('.to-read').innerText) || 0;
            y = Number(rows[i + 1].querySelector('.to-read').innerText) || 0;
            if (!(x !== 0 && y === 0) && x > y) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

// **************************************************
// **********        T O   R E A D         **********
// **************************************************
function addToRead() {
    addStyles(`
${CST_CLASS_BOOKMARK} {
    position: relative !important;
}
.to-read {
    font-style: normal;
    position: absolute;
    top: 5px;
    left: 5px;
    min-width: 20px;
    height: 20px;
    padding: 2px;
    border-radius: 100%;
    text-shadow: 0 -1px 0 rgb(0 0 0 / 40%);
    text-align: center;
    background: #ff5c19;
    color: #fff;
    font-weight: 700;
    font-size: 12px;
    line-height: 20px;
}
`);
    let bm = document.querySelectorAll(CST_CLASS_BOOKMARK);

    for (let j = 0; j < bm.length; j++) {
        if (bm[j].querySelector(CST_CLASS_NAME)) {
            let lastViewed = bm[j].querySelectorAll(CST_CLASS_TITLE)[1]
                    ? bm[j].querySelectorAll(`:scope ${CST_CLASS_TITLE} a`)[1].href.split('/')[CST_CHAPTER_URL_SPLIT_CHAPTER].replace(CST_CHAPTER_URL, '')
                    : null,
                current = bm[j].querySelectorAll(CST_CLASS_TITLE)[2]
                    ? bm[j].querySelectorAll(`:scope ${CST_CLASS_TITLE} a`)[2].href.split('/')[CST_CHAPTER_URL_SPLIT_CHAPTER].replace(CST_CHAPTER_URL, '')
                    : null;

            if (lastViewed && current) {
                let el = document.createElement('em');
                el.classList.add('to-read');
                el.innerHTML = `${parseFloat((current - lastViewed).toFixed(2))}`;
                bm[j].appendChild(el);
            }
        }
    }
}

// **************************************************
// **********     U S E R   N O T I F      **********
// **************************************************
// function getUserNotif() {
//     let xhr = new XMLHttpRequest();
//     xhr.responseType = 'document';
//     xhr.open('GET', `https://${domain}/`);
//     xhr.onload = function () {
//         if (xhr.status >= 200 && xhr.status < 400) {
//             document.querySelector(CST_CLASS_USER_NOTIF).innerHTML = xhr.responseXML.querySelector(CST_CLASS_USER_NOTIF).innerHTML;
//         }
//     };
//     xhr.send();
// }

// **************************************************
// **********        S T O R A G E         **********
// **************************************************
function diff_weeks(dt1, dt2) {
    let diff = (dt1 - dt2) / (1000 * 60 * 60 * 24 * 7);
    return Math.abs(Math.round(diff));
}

function deleteValues(force) {
    if (force || confirm('Are you sure you want to empty cache?')) {
        let keys = GM_listValues();
        console.debug(`Values to delete:`);
        console.debug(keys);
        for (let key of keys) {
            GM_deleteValue(key);
        }
        console.debug(`Done.`);
    }
}

function doRequestData(url) {
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'document';
    xhr.open('GET', url);
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 400) {
            let resp = xhr.responseXML,
                tag = resp.querySelectorAll(CST_CLASS_BTN + ' a')[1].href.split('/')[CST_CHAPTER_URL_SPLIT_MANGA],
                value = {
                    date: new Date(),
                    adult: (resp.querySelector(CST_CLASS_MANGA_ADULT)?.innerHTML.match(/Adult/gm) || []).length,
                    hype: resp.querySelector(`:scope ${CST_CLASS_MANGA_HYPE} em`) ? resp.querySelector(`:scope ${CST_CLASS_MANGA_HYPE} em`).classList[0] : null,
                    rank: resp.querySelector(`em${CST_TAG_MANGA_RANK}`)?.textContent,
                };

            GM_setValue(`${CST_NAME}_${tag}`, value);
            if (showAdult && value.adult) setAdult(tag, value.adult);
            if (showHype && value.hype) setHype(tag, value.hype);
            if (showRank && value.rank) setRank(tag, value.rank);

            console.debug(`Value updated for ${resp.querySelectorAll(CST_CLASS_BTN + ' a')[1].text.replace(/[\r\n]/gm, '')}`);
            console.debug(value);
        }
    };
    xhr.send();
}

function getData(elTmp) {
    // 404 / CORS
    if (!elTmp.querySelector(CST_CLASS_NAME).href.includes(`${CST_FULL_MANGA_URL}`)) {
        console.debug(`Value skiped for ${elTmp.querySelector(CST_CLASS_NAME).text} > ${elTmp.querySelector(CST_CLASS_NAME).href}`);
        return;
    }

    let tag = elTmp.querySelector(CST_CLASS_NAME).href.split('/')[CST_CHAPTER_URL_SPLIT_MANGA],
        value = GM_getValue(`${CST_NAME}_${tag}`, null);

    if (!forceRefresh && value && value.date && diff_weeks(new Date(value.date), new Date()) < 1) {
        if (showAdult && value.adult) setAdult(tag, value.adult);
        if (showHype && value.hype) setHype(tag, value.hype);
        if (showRank && value.rank) setRank(tag, value.rank);
    } else {
        doRequestData(`${CST_FULL_MANGA_URL}${tag}`);
    }
}

function loadData() {
    // first remove all tags
    document.querySelectorAll('.adult').forEach((i) => {
        i.parentElement.remove();
    });
    document.querySelectorAll('.genres-item-rate').forEach((i) => {
        i.remove();
    });
    document.querySelectorAll('.item-hot').forEach((i) => {
        i.remove();
    });
    document.querySelectorAll('.item-ss').forEach((i) => {
        i.remove();
    });

    let bm = document.querySelectorAll(CST_CLASS_BOOKMARK);

    if (GM_getValue('app_version', 0) !== CST_APP_VERSION) {
        deleteValues(true);
        GM_setValue('app_version', CST_APP_VERSION);
    }

    for (let j = 0; j < bm.length; j++) {
        if (bm[j].querySelector(CST_CLASS_NAME)) {
            getData(bm[j]);
        }
    }
}

function doForceRefresh() {
    if (showAdult || showHype || showRank) {
        let tmp = forceRefresh;
        forceRefresh = true;
        loadData();
        forceRefresh = tmp;
    }
}

function doBookmarkRefresh(e) {
    console.debug(`Bookmark to refresh: ${e.querySelector(CST_CLASS_NAME).text}`);
    e.querySelectorAll('.adult').forEach((i) => {
        i.parentElement.remove();
    });
    e.querySelectorAll('.genres-item-rate').forEach((i) => {
        i.remove();
    });
    e.querySelectorAll('.item-hot').forEach((i) => {
        i.remove();
    });
    e.querySelectorAll('.item-ss').forEach((i) => {
        i.remove();
    });
    doRequestData(e.querySelector(CST_CLASS_NAME).href);
}

// **************************************************
// **********           R A N K            **********
// **************************************************
function addRank() {
    addStyles(`
    .genres-item-rate{
        font-style: normal;
        position: absolute;
        left: 5px;
        bottom: 5px;
        background: rgba(0,0,0,.69);
        padding: 2px 5px 2px 8px;
        color: #d7d7da;
        font-size: 12px;
        font-style: italic;
    }
    .genres-item-rate:after{
        content: '\\2B50';
        font-style: normal;
        margin: 0;
        padding: 0;
        color: #f9d932;
    }
`);
}

function setRank(tag, value) {
    let elImg = document.querySelector(`:scope ${CST_CLASS_BOOKMARK} ${CST_CLASS_NAME}[href="${CST_FULL_MANGA_URL}${tag}"]`).parentElement.parentElement
            .parentElement,
        el = document.createElement('em');
    el.classList.add('genres-item-rate');
    el.innerHTML = `${value}`;
    elImg.appendChild(el);
}

// **************************************************
// **********           H Y P E            **********
// **************************************************
function addHype() {
    addStyles(`
    .item-hot{
        font-style: normal;
        position: absolute;
        top: 5px;
        left: 45px;
        background: #c0392b;
        border-radius: 15px;
        padding: 2px 5px;
        color: #fff;
        line-height: 25px;
        font-size: 10px;
        font-weight: 700;
    }
    .item-hot:before{
        content: "HOT";
    }
    .item-ss{
        font-style: normal;
        position: absolute;
        top: 5px;
        left: 55px;
        background: #000;
        border-radius: 15px;
        padding: 2px 5px;
        color: #fff;
        line-height: 25px;
        font-size: 10px;
        font-weight: 700;
    }
    .item-ss:before{
        content: "SS";
    }
`);
}

function setHype(tag, value) {
    if (value && value !== '' && value !== 'img-loading') {
        let elImg = document.querySelector(`:scope ${CST_CLASS_BOOKMARK} ${CST_CLASS_NAME}[href="${CST_FULL_MANGA_URL}${tag}"]`).parentElement.parentElement
                .parentElement,
            el = document.createElement('em');
        el.classList.add(`${value}`);
        elImg?.appendChild(el);
    }
}

// **************************************************
// **********          A D U L T           **********
// **************************************************
function addAdult() {
    addStyles(`
    .adult{
        position: absolute;
        top: 5px;
        left: 2px;
        font-size: 1em;
        color: #f783ac;
    }
`);
}

function setAdult(tag, value) {
    if (value > 0) {
        let elImg = document.querySelector(`:scope ${CST_CLASS_BOOKMARK} ${CST_CLASS_NAME}[href="${CST_FULL_MANGA_URL}${tag}"]`).parentElement.parentElement
                .parentElement,
            elDiv = elImg?.appendChild(document.createElement('div'));
        elDiv.innerHTML = `
        <span class="adult" title="Adult">
            <a><i style="font-size: 1.5em" class="fas fa-fw fa-ban" ></i></a>
        </span>
        `;
    }
}

// **************************************************
// **********       L I S T E N E R        **********
// **************************************************
function prepare() {
    // Move it move it
    if (moveContainerRight) moveRight();
    // Hide crap
    if (hideCrap) doHideCrap();
}
prepare();

function run() {
    // UserNotif
    //getUserNotif();
    // Menu
    addMenu();
    // BOOKMARKS
    // * Menu
    addMenuOnBookmark();
    // * ToRead
    if (showToRead) addToRead();
    // * Adult, Hype, Rank
    // ** Style
    if (showAdult) addAdult();
    if (showHype) addHype();
    if (showRank) addRank();
    // ** Data
    if (showAdult || showHype || showRank) loadData();

    document.addEventListener('keydown', (event) => {
        if (document.activeElement !== document.querySelector(CST_CLASS_SEARCH)) {
            if (event.ctrlKey || event.code === 'Meta') {
                return;
            }
            // if (event.code === 'KeyE' && event.shiftKey) {
            //     exportBookmark();
            // }
            else if (event.code === 'KeyS' && event.shiftKey) {
                letsSort();
            } else if (event.code === 'KeyT' && event.shiftKey) {
                doForceRefresh();
            } else if (event.code === 'Delete') {
                deleteValues();
            } else if (event.code === 'ArrowUp' || event.code === 'KeyW' || event.code === 'KeyZ') {
                stopScrolling();
                startScrolling(-scrollValue);
            } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
                stopScrolling();
                startScrolling(scrollValue);
            }
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.code === 'ArrowUp' || event.code === 'KeyW' || event.code === 'KeyZ' || event.code === 'ArrowDown' || event.code === 'KeyS') {
            stopScrolling();
        }
    });

    window.addEventListener('load', function () {
        console.debug('Time until everything loaded: ' + (Date.now() - timerStart).toFixed(0).toString() + 'ms');
    });
}

var init = function () {
    setTimeout(function () {
        if (document.querySelector(CST_CLASS_BOOKMARK)) {
            run();
            if (!pageCount) {
                pageCount = Number(document.querySelector(CST_CLASS_PAGE)?.lastElementChild.text.replace(/\D+/g, ''));
            }
        } else {
            init();
        }
    }, 0.5 * 1000);
};
init();
