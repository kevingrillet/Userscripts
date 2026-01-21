// ==UserScript==
// @name          [Global] Seasonal Decorations
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Adds event-based decorations (Christmas, Valentine's Day, Halloween, etc.) in background during event week. Configurable per site via CSV-like format.
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           all-sites
// @tag           decorations
// @version       1.1.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Global]%20Seasonal%20Decorations.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Global]%20Seasonal%20Decorations.user.js

// @match         http*://*/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_registerMenuCommand
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG_KEY = 'seasonal_decorations_config';
    const DEBUG_MODE_KEY = 'seasonal_decorations_debug_mode';
    const DEFAULT_CONFIG = `# Configuration format: baseurl; selector; color
# Examples:
www.google.fr; body; white
github.com; .application-main; #ffffff
# youtube.com; body; rgba(255,255,255,0.8)`;

    // Events definition with dates (month/day)
    const EVENTS = [
        { name: 'christmas', month: 12, day: 25, window: 7 }, // Noël ± 7 jours
        { name: 'newyear', month: 1, day: 1, window: 3 }, // Nouvel an ± 3 jours
        { name: 'chandeleur', month: 2, day: 2, window: 3 }, // Chandeleur ± 3 jours
        { name: 'valentine', month: 2, day: 14, window: 3 }, // Saint-Valentin ± 3 jours
        { name: 'aprilfools', month: 4, day: 1, window: 1 }, // Poisson d'avril ± 1 jour
        { name: 'musicday', month: 6, day: 21, window: 3 }, // Fête de la musique ± 3 jours
        { name: 'halloween', month: 10, day: 31, window: 7 }, // Halloween ± 7 jours
    ];

    // Calculate Easter date (Computus algorithm)
    function getEasterDate(year) {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        return { month, day };
    }

    // Check if date is within event window
    function isWithinEventWindow(eventMonth, eventDay, windowDays, currentMonth, currentDay, currentYear) {
        const eventDate = new Date(currentYear, eventMonth - 1, eventDay);
        const currentDate = new Date(currentYear, currentMonth - 1, currentDay);
        const diffTime = Math.abs(currentDate - eventDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= windowDays;
    }

    // Get current active event
    function getCurrentEvent() {
        // Check if debug mode is enabled
        const debugMode = GM_getValue(DEBUG_MODE_KEY, false);
        if (debugMode) {
            return 'christmas'; // Use Christmas decorations for debug
        }

        const now = new Date();
        const month = now.getMonth() + 1; // 1-12
        const day = now.getDate();
        const year = now.getFullYear();

        // Check fixed events
        for (const event of EVENTS) {
            if (isWithinEventWindow(event.month, event.day, event.window, month, day, year)) {
                return event.name;
            }
        }

        // Check Easter (variable date)
        const easter = getEasterDate(year);
        if (isWithinEventWindow(easter.month, easter.day, 3, month, day, year)) {
            return 'easter';
        }

        return null;
    }

    // Parse CSV-like configuration
    function parseConfig(configText) {
        const lines = configText.split('\n');
        const configs = [];

        for (const line of lines) {
            const trimmed = line.trim();
            // Skip comments and empty lines
            if (!trimmed || trimmed.startsWith('#')) continue;

            const parts = trimmed.split(';').map((p) => p.trim());
            if (parts.length >= 2) {
                configs.push({
                    baseUrl: parts[0],
                    selector: parts[1],
                    color: parts[2] || 'white',
                });
            }
        }

        return configs;
    }

    // Check if current URL matches a base URL pattern
    function matchesBaseUrl(currentHost, baseUrl) {
        return currentHost.includes(baseUrl) || baseUrl.includes(currentHost);
    }

    // Get matching configuration for current site
    function getMatchingConfig() {
        const configText = GM_getValue(CONFIG_KEY, DEFAULT_CONFIG);
        const configs = parseConfig(configText);
        const currentHost = window.location.hostname;

        for (const config of configs) {
            if (matchesBaseUrl(currentHost, config.baseUrl)) {
                return config;
            }
        }

        return null;
    }

    // Create snowflake decoration
    function createSnowflake(color) {
        return `
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <g fill="${color}" opacity="0.7">
                    <circle cx="10" cy="10" r="1.5"/>
                    <rect x="9.5" y="3" width="1" height="14"/>
                    <rect x="3" y="9.5" width="14" height="1"/>
                    <rect x="5.5" y="5.5" width="9" height="1" transform="rotate(45 10 10)"/>
                    <rect x="5.5" y="5.5" width="9" height="1" transform="rotate(-45 10 10)"/>
                </g>
            </svg>
        `;
    }

    // Create easter egg decoration
    function createEasterEgg(color) {
        return `
            <svg width="20" height="25" viewBox="0 0 20 25" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="10" cy="15" rx="8" ry="10" fill="${color}" opacity="0.7"/>
                <ellipse cx="10" cy="15" rx="6" ry="8" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.5"/>
                <line x1="5" y1="12" x2="15" y2="12" stroke="${color}" stroke-width="0.5" opacity="0.5"/>
                <line x1="5" y1="18" x2="15" y2="18" stroke="${color}" stroke-width="0.5" opacity="0.5"/>
            </svg>
        `;
    }

    // Create pumpkin decoration (Halloween)
    function createPumpkin(color) {
        return `
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="10" cy="12" rx="8" ry="7" fill="#ff8c00" opacity="0.7"/>
                <rect x="9" y="3" width="2" height="4" fill="green" opacity="0.7"/>
                <polygon points="6,10 8,12 6,14" fill="black" opacity="0.3"/>
                <polygon points="14,10 12,12 14,14" fill="black" opacity="0.3"/>
                <path d="M 7 15 Q 10 17 13 15" stroke="black" stroke-width="0.5" fill="none" opacity="0.3"/>
            </svg>
        `;
    }

    // Create heart decoration (Valentine's Day)
    function createHeart(color) {
        return `
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,17 L3,10 C1,8 1,5 3,3 C5,1 8,1 10,3 C12,1 15,1 17,3 C19,5 19,8 17,10 Z" 
                      fill="${color}" opacity="0.7"/>
            </svg>
        `;
    }

    // Create music note decoration (Fête de la musique)
    function createMusicNote(color) {
        return `
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="6" cy="16" rx="3" ry="2" fill="${color}" opacity="0.7"/>
                <rect x="8" y="4" width="1.5" height="12" fill="${color}" opacity="0.7"/>
                <ellipse cx="13" cy="13" rx="3" ry="2" fill="${color}" opacity="0.7"/>
                <rect x="15" y="2" width="1.5" height="11" fill="${color}" opacity="0.7"/>
                <path d="M 9.5 4 L 16.5 2 L 16.5 6 L 9.5 8 Z" fill="${color}" opacity="0.7"/>
            </svg>
        `;
    }

    // Create pancake decoration (Chandeleur)
    function createPancake(color) {
        return `
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="10" cy="10" rx="8" ry="3" fill="#f4d03f" opacity="0.7"/>
                <ellipse cx="10" cy="10" rx="6" ry="2" fill="#f9e79f" opacity="0.5"/>
            </svg>
        `;
    }

    // Create fish decoration (April Fools)
    function createFish(color) {
        return `
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="8" cy="10" rx="6" ry="4" fill="${color}" opacity="0.7"/>
                <polygon points="14,10 18,6 18,14" fill="${color}" opacity="0.7"/>
                <circle cx="6" cy="9" r="1" fill="black" opacity="0.5"/>
            </svg>
        `;
    }

    // Create firework decoration (New Year)
    function createFirework(color) {
        return `
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="2" fill="${color}" opacity="0.7"/>
                <line x1="10" y1="10" x2="10" y2="3" stroke="${color}" stroke-width="1" opacity="0.7"/>
                <line x1="10" y1="10" x2="17" y2="10" stroke="${color}" stroke-width="1" opacity="0.7"/>
                <line x1="10" y1="10" x2="10" y2="17" stroke="${color}" stroke-width="1" opacity="0.7"/>
                <line x1="10" y1="10" x2="3" y2="10" stroke="${color}" stroke-width="1" opacity="0.7"/>
                <line x1="10" y1="10" x2="15" y2="5" stroke="${color}" stroke-width="1" opacity="0.7"/>
                <line x1="10" y1="10" x2="15" y2="15" stroke="${color}" stroke-width="1" opacity="0.7"/>
                <line x1="10" y1="10" x2="5" y2="15" stroke="${color}" stroke-width="1" opacity="0.7"/>
                <line x1="10" y1="10" x2="5" y2="5" stroke="${color}" stroke-width="1" opacity="0.7"/>
            </svg>
        `;
    }

    // Get decoration based on current event
    function getEventDecoration(color) {
        const event = getCurrentEvent();

        switch (event) {
            case 'christmas':
                return createSnowflake(color);
            case 'newyear':
                return createFirework(color);
            case 'chandeleur':
                return createPancake(color);
            case 'valentine':
                return createHeart(color);
            case 'easter':
                return createEasterEgg(color);
            case 'aprilfools':
                return createFish(color);
            case 'musicday':
                return createMusicNote(color);
            case 'halloween':
                return createPumpkin(color);
            default:
                return null;
        }
    }

    // Add decorations to element
    function addDecorations(element, color) {
        const decoration = getEventDecoration(color);
        if (!decoration) return;

        // Create container for decorations
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            overflow: hidden;
        `;
        container.className = 'seasonal-decorations-container';

        // Create multiple decoration elements
        const count = 20; // Number of decorations
        for (let i = 0; i < count; i++) {
            const item = document.createElement('div');
            item.style.cssText = `
                position: absolute;
                pointer-events: none;
                opacity: 0;
            `;

            // Random starting position
            item.style.left = Math.random() * 100 + '%';
            item.style.top = -50 + 'px';

            // Set SVG content
            item.innerHTML = decoration;

            // Animation properties
            const duration = 10 + Math.random() * 20; // 10-30 seconds
            const delay = Math.random() * 5; // 0-5 seconds delay
            const endPosition = 100 + Math.random() * 20; // Fall beyond viewport

            // Apply animation
            item.style.animation = `fall${i} ${duration}s linear ${delay}s infinite`;

            // Create unique keyframes for each item
            const styleSheet = document.createElement('style');
            styleSheet.textContent = `
                @keyframes fall${i} {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(${endPosition}vh) rotate(${360 + Math.random() * 360}deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(styleSheet);

            container.appendChild(item);
        }

        document.body.appendChild(container);
    }

    // Edit configuration
    function editConfig() {
        const currentConfig = GM_getValue(CONFIG_KEY, DEFAULT_CONFIG);
        const newConfig = prompt('Edit seasonal decorations configuration:\nFormat: baseurl; selector; color\n(One per line, # for comments)', currentConfig);

        if (newConfig !== null) {
            GM_setValue(CONFIG_KEY, newConfig);
            alert('Configuration saved! Reload the page to apply changes.');
        }
    }

    // Toggle debug mode
    function toggleDebugMode() {
        const currentMode = GM_getValue(DEBUG_MODE_KEY, false);
        const newMode = !currentMode;
        GM_setValue(DEBUG_MODE_KEY, newMode);

        if (newMode) {
            alert('Debug mode enabled! Snowflakes will appear on configured sites.\nReload the page to see decorations.');
        } else {
            alert('Debug mode disabled! Decorations will only show during actual events.\nReload the page to apply changes.');
        }
    }

    // Initialize
    function init() {
        // Register menu commands
        const debugMode = GM_getValue(DEBUG_MODE_KEY, false);
        const debugModeLabel = debugMode ? '✅ Debug Mode: ON' : '❌ Debug Mode: OFF';

        GM_registerMenuCommand('⚙️ Edit Seasonal Decorations Config', editConfig);
        GM_registerMenuCommand(debugModeLabel + ' (Toggle)', toggleDebugMode);

        // Get configuration for current site
        const config = getMatchingConfig();
        if (!config) {
            console.log('[Seasonal Decorations] No configuration for this site');
            return;
        }

        // Wait for element to be available
        let attempts = 0;
        const maxAttempts = 20; // 10 seconds (20 * 500ms)

        const checkElement = setInterval(() => {
            attempts++;
            const element = document.querySelector(config.selector);

            if (element) {
                clearInterval(checkElement);
                addDecorations(element, config.color);
                const event = getCurrentEvent();
                console.log(`[Seasonal Decorations] Applied ${event} decorations to ${config.selector} with color ${config.color}`);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkElement);
                console.log(`[Seasonal Decorations] Element ${config.selector} not found after ${maxAttempts * 500}ms`);
            }
        }, 500);
    }

    // Run after page is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(init, 100); // Small delay to load last
        });
    } else {
        setTimeout(init, 100);
    }
})();
