// ==UserScript==
// @name          [IMDB] Google Search with Custom Suffix
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Perform a Google search from IMDB movie/series pages using a customizable suffix (e.g., site:youtube.com).
// @copyright     Kevin GRILLET
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           imdb.com
// @version       1.0.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[IMDB]%20Google%20Search%20with%20Custom%20Suffix.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[IMDB]%20Google%20Search%20with%20Custom%20Suffix.user.js

// @match         https://www.imdb.com/title/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=imdb.com
// @grant         GM_registerMenuCommand
// @grant         GM_openInTab
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = 'imdb_search_suffix';

    // Default value
    function getSuffix() {
        return localStorage.getItem(STORAGE_KEY) || 'site:youtube.com';
    }

    function setSuffix(newSuffix) {
        localStorage.setItem(STORAGE_KEY, newSuffix);
        alert('Suffix updated: ' + newSuffix);
    }

    // Extract the movie/series title
    function getMovieTitle() {
        const el = document.querySelector('h1[data-testid="hero__pageTitle"] span[data-testid="hero__primary-text"]');
        return el ? el.textContent.trim() : null;
    }

    // Perform the Google search with the stored suffix
    function searchGoogle() {
        const title = getMovieTitle();
        if (!title) {
            alert('Could not retrieve the movie title!');
            return;
        }
        const suffix = getSuffix();
        const query = encodeURIComponent(title + ' ' + suffix);
        const url = 'https://www.google.com/search?q=' + query;
        GM_openInTab(url, { active: true });
    }

    // Change the suffix
    function changeSuffix() {
        const current = getSuffix();
        const newSuffix = prompt('Enter a new Google search suffix:', current);
        if (newSuffix) {
            setSuffix(newSuffix.trim());
        }
    }

    // Tampermonkey menu entries
    GM_registerMenuCommand('🔎 Google Search', searchGoogle);
    GM_registerMenuCommand('⚙️ Change Suffix', changeSuffix);
})();
