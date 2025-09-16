// ==UserScript==
// @name          [Global] Auto Refresh
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Auto-refresh pages every X minutes (per site), with optional jitter. Configurable via Tampermonkey menu.
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           all-sites
// @version       1.0.2

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Global]%20Auto%20Refresh.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Global]%20Auto%20Refresh.user.js

// @match         http*://*/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant         GM_registerMenuCommand
// @grant         GM_getValue
// @grant         GM_setValue
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    const DEF_INTERVAL_KEY = 'default_interval';
    const DEF_JITTER_KEY = 'default_jitter';
    const SITE_INTERVAL_PREFIX = 'site_interval_';
    const SITE_ENABLED_PREFIX = 'site_enabled_';

    const DEFAULT_MINUTES = 5;
    const DEFAULT_JITTER = 0;

    const host = location.hostname;

    function formatDelay(ms) {
        let totalSec = Math.floor(ms / 1000);
        let h = Math.floor(totalSec / 3600);
        let m = Math.floor((totalSec % 3600) / 60);
        let s = totalSec % 60;
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function formatTime(date) {
        let h = String(date.getHours()).padStart(2, '0');
        let m = String(date.getMinutes()).padStart(2, '0');
        let s = String(date.getSeconds()).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function schedule() {
        if (!GM_getValue(SITE_ENABLED_PREFIX + host, false)) {
            console.log('[AutoRefresh] Disabled for ' + host);
            return;
        }

        let siteInterval = GM_getValue(SITE_INTERVAL_PREFIX + host, 0);
        let base = siteInterval > 0 ? siteInterval : GM_getValue(DEF_INTERVAL_KEY, DEFAULT_MINUTES);
        if (base <= 0) return;

        let jitter = GM_getValue(DEF_JITTER_KEY, DEFAULT_JITTER);
        let delay = base * 60000 + (jitter > 0 ? Math.random() * jitter * 1000 : 0);

        let next = new Date(Date.now() + delay);
        console.log(`[AutoRefresh] ${host} → reload in ${formatDelay(delay)} (at ${formatTime(next)})`);

        setTimeout(() => location.reload(), delay);
    }

    // --- Menu ---
    GM_registerMenuCommand('Toggle AutoRefresh for ' + host + ' (' + (GM_getValue(SITE_ENABLED_PREFIX + host, false) ? 'ON' : 'OFF') + ')', () => {
        GM_setValue(SITE_ENABLED_PREFIX + host, !GM_getValue(SITE_ENABLED_PREFIX + host, false));
        location.reload();
    });

    GM_registerMenuCommand('Set default interval (min)', () => {
        let val = prompt('Default interval in minutes:', GM_getValue(DEF_INTERVAL_KEY, DEFAULT_MINUTES));
        if (val !== null) GM_setValue(DEF_INTERVAL_KEY, parseInt(val) || 0);
        location.reload();
    });

    GM_registerMenuCommand('Set interval for this site (' + host + ')', () => {
        let val = prompt('Interval for ' + host + ' (minutes, 0=use default):', GM_getValue(SITE_INTERVAL_PREFIX + host, 0));
        if (val !== null) GM_setValue(SITE_INTERVAL_PREFIX + host, parseInt(val) || 0);
        location.reload();
    });

    GM_registerMenuCommand('Set jitter (sec)', () => {
        let val = prompt('Random jitter in seconds (0 = none):', GM_getValue(DEF_JITTER_KEY, DEFAULT_JITTER));
        if (val !== null) GM_setValue(DEF_JITTER_KEY, parseInt(val) || 0);
        location.reload();
    });

    schedule();
})();
