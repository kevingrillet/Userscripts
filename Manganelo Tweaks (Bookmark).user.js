// ==UserScript==
// @name          Manganelo Tweaks (Bookmark)
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Export Bookmark, repair user-notification
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.7

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://github.com/kevingrillet/Userscripts/raw/main/Manganelo%20Tweaks%20(Bookmark).user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/Manganelo%20Tweaks%20(Bookmark).user.js

// @match         *://manganelo.com/bookmark*
// @require       https://use.fontawesome.com/releases/v5.15.2/js/all.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.4/FileSaver.min.js
// @run-at        document-end
// ==/UserScript==


// **************************************************
// **********   C A N   B E   E D I T E D  **********
// **************************************************
var moveContainerRight = true, // Move MOST POPULAR MANGA & MANGA BY GENRES to bottom
    moveContinerTop = true, // Move top to bottom, need right to be active
    showToRead = true,
    env = [
        {
            name: 'Manganelo', // Name
            match: '^.*:\/\/manganelo.com\/bookmark.*', // Match needed to know we are here
            chapter_url: 'chapter_', // to remove chapter from link to do proper count
            class_blue: 'page-blue', // class to find active page
            class_bookmark: 'bookmark-item', // class bookmark
            class_bookmark_panel: 'panel-bookmark', // class contain all bookmarks
            class_btn: 'panel-breadcrumb', // class to add icon
            class_container_left: 'container-main-left', // class container bookmark
            class_container_right: 'container-main-right', // class container popular / by genre
            class_img: 'img-loading', // class to get image cover
            class_name: 'item-story-name', // class manga title
            class_page: 'group-page', // class div pages
            class_slider: 'container container-silder', // class containing the top slider
            class_title: 'item-title', // class for Viewed / Current row
            class_user_notif: 'user-notification' // class to copy number of notifs from home page
        }
    ];


// **************************************************
// **********      V A R I A B L E S       **********
// **************************************************
var CST_CHAPTER_URL = null,
    CST_CLASS_BLUE = null,
    CST_CLASS_BOOKMARK = null,
    CST_CLASS_BOOKMARK_PANEL = null,
    CST_CLASS_BTN = null,
    CST_CLASS_CONTAINER_LEFT = null,
    CST_CLASS_CONTAINER_RIGHT = null,
    CST_CLASS_IMG = null,
    CST_CLASS_NAME = null,
    CST_CLASS_PAGE = null,
    CST_CLASS_SLIDER = null,
    CST_CLASS_TITLE = null,
    CST_CLASS_USER_NOTIF = null;

env.some(function(e){
    if (e.match && new RegExp(e.match, 'i').test(window.location.href)) {
        CST_CHAPTER_URL = e.chapter_url;
        CST_CLASS_BLUE = '.' + e.class_blue.replace(' ', '.');
        CST_CLASS_BOOKMARK = '.' + e.class_bookmark.replace(' ', '.');
        CST_CLASS_BOOKMARK_PANEL = '.' + e.class_bookmark_panel.replace(' ', '.');
        CST_CLASS_BTN = '.' + e.class_btn.replace(' ', '.');
        CST_CLASS_CONTAINER_LEFT = '.' + e.class_container_left.replace(' ', '.');
        CST_CLASS_CONTAINER_RIGHT = '.' + e.class_container_right.replace(' ', '.');
        CST_CLASS_IMG = '.' + e.class_img.replace(' ', '.');
        CST_CLASS_NAME = '.' + e.class_name.replace(' ', '.');
        CST_CLASS_PAGE = '.' + e.class_page.replace(' ', '.');
        CST_CLASS_SLIDER = '.' + e.class_slider.replace(' ', '.');
        CST_CLASS_TITLE = '.' + e.class_title.replace(' ', '.');
        CST_CLASS_USER_NOTIF = '.' + e.class_user_notif.replace(' ', '.');
    }
});

var domain = window.location.hostname,
    head = document.head,
    pageCount = Number(document.querySelector(CST_CLASS_PAGE).lastElementChild.text.replace(/\D+/g, '')),
    sortStyleInjected = false;


// **************************************************
// **********           M E N U            **********
// **************************************************
// require: https://use.fontawesome.com/releases/v5.15.2/js/all.js
function addStyles(css) {
    let style = head.appendChild(document.createElement('style'));
    style.type = 'text/css';
    style.innerHTML = css;
}

addStyles(`
#my_export { cursor: pointer; float: right; }
#my_export span { font-size: 1em; color: GhostWhite; }
`);

var elDiv = document.querySelector(CST_CLASS_BTN).appendChild(document.createElement('div'));
elDiv.id = 'my_export';
elDiv.innerHTML = `
  <span class="export" title="Export (Shift + E)">
    <a><i class="fas fa-fw fa-file-download" ></i></a>
  </span>
  <span class="sort" title="Sort (Shift + S)">
    <a><i class="fas fa-fw fa-minus-square" ></i></a>
  </span>
`;


// **************************************************
// **********       O N   C L I C K        **********
// **************************************************
document.querySelector('.export').onclick = function() { exportBookmark(); };
document.querySelector('.sort').onclick = function() { letsSort(); };


// **************************************************
// **********       L I S T E N E R        **********
// **************************************************
document.addEventListener('keydown', event => {
    if (event.code == 'KeyE' && event.shiftKey) {
        exportBookmark();
    }
    else if (event.code == 'KeyS' && event.shiftKey) {
        letsSort();
    }
});


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
        time = d.getFullYear() + '.' + ('0' + parseInt(d.getMonth()+1)).slice(-2) + '.' + ('0' + d.getDate()).slice(-2) + '_' + ('0' + d.getHours()).slice(-2) + '.' + ('0' + d.getMinutes()).slice(-2),
        fileData = new Blob([saveData], {type:'application/octet-stream'});

    saveAs(fileData, 'manga_bookmark_' + time + '.csv')
}

function exportBookmark(){
    deleteTemp();

    var elDivTemp = document.body.appendChild(document.createElement('div'));
    elDivTemp.id = 'temp_data';

    var pageSuccess = 0,
        toSave = `${domain} Bookmark`;
    toSave += `;To Read`;
    toSave += `;Title Viewed`;
    toSave += `;Title Current`;
    toSave += `;Link Viewed`;
    //toSave += `;Link Current`;
    //toSave += `;Chapter Viewed`;
    //toSave += `;Chapter Current`;
    toSave += `\n`;

    for(var i = 0; i < pageCount; i++) {
        // Prepare divs for info (useless but easier to debug)
        var elDivPage = elDivTemp.appendChild(document.createElement('div'));
        elDivPage.id = `page${i+1}`;

        let request = new XMLHttpRequest();
        request.responseType = 'document';
        request.open('GET', `https://${domain}/bookmark?page=${i+1}`);
        request.onload = function() {
            // Let's add info into the pages div
            if (request.status >= 200 && request.status < 400) {
                pageSuccess++;
                var resp = request.responseXML;
                var p = resp.querySelectorAll(`:scope ${CST_CLASS_PAGE} ${CST_CLASS_BLUE}`)[1].text; // 0 is first, 1 is current, 2 is last
                document.querySelector(`#page${p}`).innerHTML = resp.querySelector(CST_CLASS_BOOKMARK_PANEL).innerHTML;
            }

            // Last page is load, let's save
            if (pageSuccess == pageCount) {
                var bm = document.querySelectorAll(`:scope #temp_data ${CST_CLASS_BOOKMARK}`);
                for (var j = 0; j < bm.length; j++) {
                    var bookmarkTitle = bm[j].querySelector(CST_CLASS_NAME)
                    if (bookmarkTitle) {
                        var lastViewed = bm[j].querySelector(CST_CLASS_TITLE) ? bm[j].querySelector(`:scope ${CST_CLASS_TITLE} a`) : null,
                            current = bm[j].querySelectorAll(CST_CLASS_TITLE)[1] ? bm[j].querySelectorAll(CST_CLASS_TITLE)[1].querySelector('a') : null;

                        toSave += bookmarkTitle.text;
                        toSave += `;${lastViewed && current ? (current.href.split("/")[5].replace(CST_CHAPTER_URL,'') - lastViewed.href.split("/")[5].replace(CST_CHAPTER_URL,'')).toFixed(2).replace('.',',') : 'Not Found' }`;
                        toSave += `;${lastViewed && current ? lastViewed.text : 'Not Found' }`;
                        toSave += `;${lastViewed && current ? current.text : 'Not Found' }`;
                        toSave += `;${lastViewed && current ? lastViewed.href : 'Not Found' }`;
                        //toSave += `;${lastViewed && current ? current.href : 'Not Found' }`;
                        //toSave += `;${lastViewed && current ? lastViewed.href.split("/")[5].replace(CST_CHAPTER_URL,'').replace('.',',') : 'Not Found' }`;
                        //toSave += `;${lastViewed && current ? current.href.split("/")[5].replace(CST_CHAPTER_URL,'').replace('.',',') : 'Not Found' }`;
                        toSave += ` \n`;
                    }
                }
                saveFile(toSave);
                deleteTemp();
            }
        };
        request.send();
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
`
             );
    if (moveContinerTop) moveTop();
}
if (moveContainerRight) moveRight();

function moveTop() {
    document.querySelector(CST_CLASS_CONTAINER_LEFT).parentNode.insertBefore(document.querySelector('.container.container-silder'), document.querySelector(CST_CLASS_CONTAINER_RIGHT));
}


// **************************************************
// **********           S O R T            **********
// **************************************************
function letsSort() {
    var tmp = document.querySelector('#my_table'),
        bm = document.querySelectorAll(CST_CLASS_BOOKMARK);

    if (tmp) {
        tmp.remove();
        bm.forEach(e=>{e.style.display = 'block'});
        return;
    }

    var elDiv = document.querySelector(CST_CLASS_BOOKMARK_PANEL).appendChild(document.createElement('div')),
        elTable = elDiv.appendChild(document.createElement('table')),
        elThead = elTable.appendChild(document.createElement('thead')),
        elTbody = elTable.appendChild(document.createElement('tbody'));

    elTable.id = 'my_table';

    if (!sortStyleInjected){
        sortStyleInjected = true;
        addStyles(`
#my_table {
	color: Silver;
    width: 100%;
}
#my_table a{
	color: #079eda;
}
#my_footer a:link, #my_footer a:visited, #my_footer a:hover, #my_footer a:active {
    text-decoration: underline;
}
#my_table img {
    margin-right: 0;
}
#my_table th,td {
    border-bottom: 1px solid #ddd;
    padding: 15px;
    vertical-align : middle;
}
#my_table th {
	background-color: #FF7D47;
	color: black;
	text-transform: uppercase;
	font-weight: bolder;
}
#my_table tr {
	background-color: #323232;
}
#my_table tbody tr:nth-child(even) {
	background-color: #282828;
}
#my_table tbody tr:hover {
	background-color: #656565;
}
`
        );
    }

    elThead.innerHTML = '<tr><th>To read</th><th>Cover</th><th>Title</th><th>Viewed</th></tr>';

    for (var j = 0; j < bm.length; j++) {
        var bookmarkTitle = bm[j].querySelector(CST_CLASS_NAME);
        if (bookmarkTitle) {
            var elTr = document.createElement('tr'),
                lastViewed = bm[j].querySelector(CST_CLASS_TITLE) ? bm[j].querySelector(`:scope ${CST_CLASS_TITLE} a`) : null,
                current = bm[j].querySelectorAll(CST_CLASS_TITLE)[1] ? bm[j].querySelectorAll(CST_CLASS_TITLE)[1].querySelector('a') : null;

            elTr.innerHTML = `<td style="text-align: center;">${lastViewed && current ? parseFloat((current.href.split("/")[5].replace(CST_CHAPTER_URL,'') - lastViewed.href.split("/")[5].replace(CST_CHAPTER_URL,'')).toFixed(2)) : 'Not Found' }</td>
						<td><img src="${bm[j].querySelector(CST_CLASS_IMG).src}"></td>
						<td>${bookmarkTitle.text}</td>
						<td><a href="${lastViewed && current ? lastViewed.href : 'Not Found' }">${lastViewed && current ? lastViewed.text : 'Not Found' }</a></td>`;

            elTbody.appendChild(elTr);
        }
    }

    bm.forEach(e=>{e.style.display = 'none'});
    elDiv.classList.add(CST_CLASS_BOOKMARK.replace('.',''));

    sortTable();
}

function sortTable() {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.querySelector('#my_table');
    switching = true;
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[0];
            y = rows[i + 1].getElementsByTagName("TD")[0];
            if (Number(x.innerHTML) > Number(y.innerHTML)) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
};


// **************************************************
// **********        T O   R E A D         **********
// **************************************************
function addToRead(){
    addStyles(`
${CST_CLASS_BOOKMARK} {
    position: relative !important;
}
.to-read {
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
`
             );
    var bm = document.querySelectorAll(CST_CLASS_BOOKMARK);

    for (var j = 0; j < bm.length; j++) {
        if (bm[j].querySelector(CST_CLASS_NAME)) {
            var lastViewed = bm[j].querySelector(CST_CLASS_TITLE) ? bm[j].querySelector(`:scope ${CST_CLASS_TITLE} a`).href.split("/")[5].replace(CST_CHAPTER_URL,'') : null,
                current = bm[j].querySelectorAll(CST_CLASS_TITLE)[1] ? bm[j].querySelectorAll(CST_CLASS_TITLE)[1].querySelector('a').href.split("/")[5].replace(CST_CHAPTER_URL,'') : null;

            if (lastViewed && current) {
                var el = document.createElement('em');
                el.classList.add('to-read');
                el.innerHTML = `${parseFloat((current-lastViewed).toFixed(2))}`;
                bm[j].appendChild(el);
            }
        }
    }
}
if (showToRead) addToRead();


// **************************************************
// **********     U S E R   N O T I F      **********
// **************************************************
function getUserNotif() {
    let request = new XMLHttpRequest();
    request.responseType = 'document';
    request.open('GET', `https://${domain}/`);
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            document.querySelector(CST_CLASS_USER_NOTIF).innerHTML = request.responseXML.querySelector(CST_CLASS_USER_NOTIF).innerHTML;
        }
    };
    request.send();
}
getUserNotif();
