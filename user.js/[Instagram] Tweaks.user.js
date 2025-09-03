// ==UserScript==
// @name          [Instagram] Tweaks
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Add menu commands to auto scroll, export CSV, and open links from CSV on Instagram
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           instagram.com
// @version       1.0.0
//
// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Instagram]%20Tweaks.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Instagram]%20Tweaks.user.js
//
// @match         https://www.instagram.com/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=instagram.com
// @grant         GM_registerMenuCommand
// @grant         GM_getValue
// @grant         GM_setValue
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    // ---- Auto scroll until content stops loading ----
    function autoScrollUntilStable(el, minDelay = 2000, maxDelay = 4000) {
        let lastScrollTop = -1;
        let unchangedCount = 0;

        function loop() {
            el.scrollTop = el.scrollHeight;

            if (el.scrollTop === lastScrollTop) {
                unchangedCount++;
            } else {
                unchangedCount = 0;
                lastScrollTop = el.scrollTop;
            }

            if (unchangedCount < 5) {
                const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
                setTimeout(loop, delay);
            } else {
                alert('✅ Auto scroll finished (no movement detected 5 times in a row).');
            }
        }

        loop();
    }

    // ---- Export elements to CSV ----
    function exportCSVFromElements(els) {
        let results = Array.from(els).map((el) => ({
            text: el.innerText.trim(),
            href: el.href || '',
        }));

        // Sort alphabetically by text
        results.sort((a, b) => a.text.localeCompare(b.text, 'en', { sensitivity: 'base' }));

        let csv = 'text,href\n';
        csv += results.map((r) => `"${r.text.replace(/"/g, '""')}","${r.href.replace(/"/g, '""')}"`).join('\n');

        // Generate filename with date & time
        const now = new Date();
        const timestamp =
            now.getFullYear() +
            '-' +
            String(now.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(now.getDate()).padStart(2, '0') +
            '_' +
            String(now.getHours()).padStart(2, '0') +
            '-' +
            String(now.getMinutes()).padStart(2, '0') +
            '-' +
            String(now.getSeconds()).padStart(2, '0');

        const filename = `export_${timestamp}.csv`;

        // Download the CSV file
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert(`✅ CSV export finished (${results.length} items, sorted alphabetically).\nFile: ${filename}`);
    }

    // ---- Open links from pasted CSV ----
    function openLinksFromCSV(csvPart) {
        const lines = csvPart
            .trim()
            .split(/\r?\n/)
            .filter((l) => l.trim());
        if (!lines.length) {
            alert('❌ No CSV content provided.');
            return;
        }

        const start = lines[0].toLowerCase().startsWith('text,href') ? 1 : 0;

        let opened = 0;
        for (let i = start; i < lines.length; i++) {
            const match = lines[i].match(/"([^"]*)","([^"]*)"/);
            if (match) {
                const href = match[2];
                if (href) {
                    window.open(href, '_blank');
                    opened++;
                }
            }
        }

        alert(`✅ ${opened} tabs opened from CSV.`);
    }

    // ---- Tampermonkey menu commands ----
    GM_registerMenuCommand('▶️ Auto Scroll', () => {
        const lastSelector = GM_getValue('scrollSelector', '');
        const selector = prompt('Enter the CSS selector of the element to scroll:', lastSelector);
        if (!selector) return;

        const el = document.querySelector(selector);
        if (!el) {
            alert('❌ No element found with this selector.');
            return;
        }

        GM_setValue('scrollSelector', selector);
        autoScrollUntilStable(el);
    });

    GM_registerMenuCommand('📂 Export CSV', () => {
        const lastSelector = GM_getValue('exportSelector', 'a');
        const selector = prompt('Enter the CSS selector of the elements to export:', lastSelector);
        if (!selector) return;

        const els = document.querySelectorAll(selector);
        if (!els.length) {
            alert('❌ No elements found with this selector.');
            return;
        }

        GM_setValue('exportSelector', selector);
        exportCSVFromElements(els);
    });

    GM_registerMenuCommand('🌐 Open Links from CSV', () => {
        const csvInput = prompt('Paste here the CSV lines to open (format: "text","href").\n\n⚠️ Links will be opened in new tabs.');
        if (!csvInput) return;
        openLinksFromCSV(csvInput);
    });
})();
