// ==UserScript==
// @name          [Global] Auto Refresh
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Auto-refresh pages every X minutes (per site), with optional jitter. Configurable via Tampermonkey menu.
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           all-sites
// @version       1.0.1

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

    const DEF_INTERVAL_KEY = 'default_interval'; // minutes
    const DEF_JITTER_KEY = 'default_jitter'; // seconds
    const ENABLED_KEY = 'enabled';
    const SITE_KEY_PREFIX = 'site_interval_';

    const DEFAULT_MINUTES = 5;
    const DEFAULT_JITTER = 0;

    const host = location.hostname;

    function isEnabled() {
        return GM_getValue(ENABLED_KEY, true);
    }

    function schedule() {
        if (!isEnabled()) {
            console.log('[AutoRefresh] Disabled');
            return;
        }
        let base = GM_getValue(SITE_KEY_PREFIX + host, 0);
        if (base === 0) base = GM_getValue(DEF_INTERVAL_KEY, DEFAULT_MINUTES);
        if (base <= 0) return;
        let jitter = GM_getValue(DEF_JITTER_KEY, DEFAULT_JITTER);
        let delay = base * 60000 + (jitter > 0 ? Math.random() * jitter * 1000 : 0);
        console.log(`[AutoRefresh] Reload in ${(delay / 1000).toFixed(1)}s`);
        setTimeout(() => location.reload(), delay);
    }

    // --- Menu ---
    GM_registerMenuCommand('Toggle AutoRefresh (' + (isEnabled() ? 'ON' : 'OFF') + ')', () => {
        GM_setValue(ENABLED_KEY, !isEnabled());
        location.reload();
    });

    GM_registerMenuCommand('Set default interval (min)', () => {
        let val = prompt('Default interval in minutes:', GM_getValue(DEF_INTERVAL_KEY, DEFAULT_MINUTES));
        if (val !== null) GM_setValue(DEF_INTERVAL_KEY, parseInt(val) || 0);
        location.reload();
    });

    GM_registerMenuCommand('Set interval for this site (' + host + ')', () => {
        let val = prompt('Interval for ' + host + ' (minutes, 0=use default):', GM_getValue(SITE_KEY_PREFIX + host, 0));
        if (val !== null) GM_setValue(SITE_KEY_PREFIX + host, parseInt(val) || 0);
        location.reload();
    });

    GM_registerMenuCommand('Set jitter (sec)', () => {
        let val = prompt('Random jitter in seconds (0 = none):', GM_getValue(DEF_JITTER_KEY, DEFAULT_JITTER));
        if (val !== null) GM_setValue(DEF_JITTER_KEY, parseInt(val) || 0);
        location.reload();
    });

    schedule();
})();
