// ==UserScript==
// @name          Manganelo Tweaks (Bookmark)
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Export Bookmark, repair user-notification
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://github.com/kevingrillet/Userscripts/raw/main/Manganelo%20Tweaks%20(Bookmark).user.js
// @updateURL     https://github.com/kevingrillet/Userscripts/raw/main/Manganelo%20Tweaks%20(Bookmark).user.js

// @match         *://manganelo.com/bookmark*
// @require       https://use.fontawesome.com/releases/v5.15.2/js/all.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.4/FileSaver.min.js
// @run-at        document-end
// ==/UserScript==

// Can be edited
var env = [
    {
        name: 'Manganelo', // Name
        match: '^.*:\/\/manganelo.com\/bookmark.*', // Match needed to know we are here
        chapter_url: 'chapter_',
        class_blue: 'page-blue',
        class_bookmark: 'bookmark-item',
        class_bookmark_panel: 'panel-bookmark',
        class_btn: 'panel-breadcrumb',
        class_name: 'item-story-name',
        class_page: 'group-page',
        class_title: 'item-title',
        class_user_notif: 'user-notification'
    }
];

// Env consts
var CST_CHAPTER_URL = null,
    CST_CLASS_BLUE = null,
    CST_CLASS_BOOKMARK = null,
    CST_CLASS_BOOKMARK_PANEL = null,
    CST_CLASS_BTN = null,
    CST_CLASS_NAME = null,
    CST_CLASS_PAGE = null,
    CST_CLASS_TITLE = null,
    CST_CLASS_USER_NOTIF = null;

env.some(function(e){
    if (e.match && new RegExp(e.match, 'i').test(window.location.href)) {
        CST_CHAPTER_URL = e.chapter_url;
        CST_CLASS_BLUE = e.class_blue;
        CST_CLASS_BOOKMARK = e.class_bookmark;
        CST_CLASS_BOOKMARK_PANEL = e.class_bookmark_panel;
        CST_CLASS_BTN = e.class_btn;
        CST_CLASS_NAME = e.class_name;
        CST_CLASS_PAGE = e.class_page;
        CST_CLASS_TITLE = e.class_title;
        CST_CLASS_USER_NOTIF = e.class_user_notif;
    }
});

var domain = window.location.hostname,
    head = document.getElementsByTagName('head')[0],
    pageCount = Number(document.getElementsByClassName(CST_CLASS_PAGE)[0].lastElementChild.text.replace(/\D+/g, ''));

// Menu
function addStyles(css) {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

addStyles(`
#my_export { cursor: pointer; float: right; }
`);

var elDiv = document.createElement('div');
elDiv.id = 'my_export';
elDiv.innerHTML = `
  <span class="export" style="font-size: 1em; color: GhostWhite;" title="Export (Shift + E)">
    <a><i class="fas fa-fw fa-file-download" ></i></a>
  </span>
`;
document.getElementsByClassName(CST_CLASS_BTN)[0].append(elDiv);

document.getElementsByClassName('export')[0].onclick = function() { exportBookmark(); };

document.addEventListener('keydown', event => {
    if (event.code == 'KeyE' && event.shiftKey) {
        exportBookmark();
    }
});


// Get
function getUserNotif() {
    let request = new XMLHttpRequest();
    request.responseType = 'document';
    request.open('GET', `https://${domain}/`);
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            document.getElementsByClassName(CST_CLASS_USER_NOTIF)[0].innerHTML = request.responseXML.getElementsByClassName(CST_CLASS_USER_NOTIF)[0].innerHTML;
        }
    };
    request.send();
}
getUserNotif();

// Export
function deleteTemp() {
    if (document.getElementById('temp_data')) {
        document.getElementById('temp_data').remove();
    }
}

// require       https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.4/FileSaver.min.js
function saveFile(saveData) {
    let d = new Date(),
        time = d.getFullYear() + '.' + ('0' + parseInt(d.getMonth()+1)).slice(-2) + '.' + ('0' + d.getDate()).slice(-2) + '_' + ('0' + d.getHours()).slice(-2) + '.' + ('0' + d.getMinutes()).slice(-2),
        fileData = new Blob([saveData], {type:'application/octet-stream'});

    saveAs(fileData, 'manga_bookmark_' + time + '.csv')
}

function exportBookmark(){
    deleteTemp();

    var elDivTemp = document.createElement('div');
    elDivTemp.id = 'temp_data';
    document.body.append(elDivTemp);

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
        var elDivPage = document.createElement('div');
        elDivPage.id = `page${i+1}`;
        elDivTemp.append(elDivPage);

        let request = new XMLHttpRequest();
        request.responseType = 'document';
        request.open('GET', `https://${domain}/bookmark?page=${i+1}`);
        request.onload = function() {
            // Let's add info into the pages div
            if (request.status >= 200 && request.status < 400) {
                pageSuccess++;
                var resp = request.responseXML;
                //elDivTemp += resp.getElementsByClassName(CST_CLASS_BOOKMARK_PANEL)[0].innerHTML;
                var p = resp.getElementsByClassName(CST_CLASS_PAGE)[0].getElementsByClassName(CST_CLASS_BLUE)[1].text; // 0 is first, 1 is current, 2 is last
                document.getElementById(`page${p}`).innerHTML = resp.getElementsByClassName(CST_CLASS_BOOKMARK_PANEL)[0].innerHTML;
            }

            // Last page is load, let's save
            if (pageSuccess == pageCount) {
                var bm = document.getElementById('temp_data').getElementsByClassName(CST_CLASS_BOOKMARK);
                for (var j = 0; j < bm.length; j++) {
                    var bookmarkTitle = bm[j].getElementsByClassName(CST_CLASS_NAME)[0]
                    if (bookmarkTitle) {
                        var lastViewed = bm[j].getElementsByClassName(CST_CLASS_TITLE)[0] ? bm[j].getElementsByClassName(CST_CLASS_TITLE)[0].getElementsByTagName('a')[0] : null,
                            current = bm[j].getElementsByClassName(CST_CLASS_TITLE)[1] ? bm[j].getElementsByClassName(CST_CLASS_TITLE)[1].getElementsByTagName('a')[0] : null;

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
