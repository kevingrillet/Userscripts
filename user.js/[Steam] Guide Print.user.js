// ==UserScript==
// @name          [Steam] Guide Print
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Improves the print layout of Steam Community guides with a toggleable light/dark theme, hiding unnecessary elements and making the guide content full-width
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           steamcommunity.com
// @version       1.1.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Steam]%20Guide%20Print.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Steam]%20Guide%20Print.user.js

// @match         https://steamcommunity.com/sharedfiles/filedetails/?id=*
// @match         https://steamcommunity.com/sharedfiles/filedetails/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=steamcommunity.com
// @grant         GM_addStyle
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_registerMenuCommand
// @grant         GM_unregisterMenuCommand
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    // Only apply on guide pages (check for guide-specific elements)
    if (!document.querySelector('.guide.subSections, .guideTop')) return;

    // ===== THEME TOGGLE =====
    const STORAGE_KEY = 'printTheme';
    let isDark = GM_getValue(STORAGE_KEY, false);
    let styleElement = null;
    let menuCommandId = null;

    function getMenuLabel() {
        return isDark ? '🌙 Print: Dark theme (click for Light)' : '☀️ Print: Light theme (click for Dark)';
    }

    function registerMenu() {
        if (menuCommandId !== null) {
            GM_unregisterMenuCommand(menuCommandId);
        }
        menuCommandId = GM_registerMenuCommand(getMenuLabel(), toggleTheme);
    }

    function toggleTheme() {
        isDark = !isDark;
        GM_setValue(STORAGE_KEY, isDark);
        applyStyle();
        registerMenu();
    }

    function applyStyle() {
        if (styleElement) {
            styleElement.remove();
            styleElement = null;
        }
        styleElement = GM_addStyle(isDark ? darkStyle : lightStyle);
    }

    // ===== SHARED HIDE RULES =====
    const hideRules = `
        @media print {
            /* ===== HIDE UNNECESSARY ELEMENTS ===== */

            /* Global header / navigation bar */
            #global_header,
            .responsive_page_menu_ctn,
            .responsive_local_menu_tab,
            .responsive_header,
            .responsive_page_content_overlay {
                display: none !important;
            }

            /* App hub header tabs (All, Discussions, Screenshots, etc.) */
            .apphub_sectionTabs,
            .apphub_sectionTabsHR,
            .nonresponsive_hidden {
                display: none !important;
            }

            /* Breadcrumbs */
            .breadcrumbs {
                display: none !important;
            }

            /* Right sidebar (author info, guide sections nav, stats, etc.) */
            #rightContents {
                display: none !important;
            }

            /* Guide controls (subscribe, favorite, share, rate, etc.) */
            .workshopItemControlsCtn,
            #ScrollingItemControls,
            .workshopItemControls,
            .ratingSection {
                display: none !important;
            }

            /* Comments section */
            .commentthread_area {
                display: none !important;
            }

            /* Footer */
            #footer,
            #footer_spacer,
            #footer_responsive_optin_spacer {
                display: none !important;
            }

            /* Various modals and overlays */
            .responsive_page_template_content > .valve_links,
            .newmodal,
            .newmodal_background {
                display: none !important;
            }

            /* Background images and decorative elements */
            .apphub_HeaderBottomBG_ctn,
            .apphub_background_gradient {
                display: none !important;
            }

            /* ===== LAYOUT: MAKE GUIDE FULL WIDTH ===== */

            body,
            .responsive_page_frame,
            .responsive_page_content,
            .responsive_page_template_content {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            #sharedfiles_content_ctn {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            #profileBlock {
                width: 100% !important;
                max-width: 100% !important;
                float: none !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            .guide.subSections {
                width: 100% !important;
                max-width: 100% !important;
            }

            /* Guide top section (title + description) */
            .guideTop {
                background: none !important;
                border: none !important;
            }

            .workshopItemTitle {
                font-size: 24pt !important;
                margin-bottom: 10px !important;
            }

            .guideTopDescription {
                font-size: 11pt !important;
            }

            /* Guide sub-sections */
            .subSection.detailBox {
                background: none !important;
                border: none !important;
                padding: 10px 0 !important;
                margin: 0 !important;
                page-break-inside: avoid;
            }

            .subSectionTitle {
                font-size: 16pt !important;
                font-weight: bold !important;
                margin-bottom: 8px !important;
            }

            .subSectionDesc {
                font-size: 11pt !important;
                line-height: 1.5 !important;
            }

            /* Images inside the guide */
            .subSectionDesc img {
                max-width: 100% !important;
                height: auto !important;
                page-break-inside: avoid;
            }

            /* Links: show URL after link text */
            .subSectionDesc a::after {
                content: " (" attr(href) ")";
                font-size: 9pt;
            }

            /* Don't show URL for internal Steam links and image links */
            .subSectionDesc a:has(img)::after,
            .subSectionDesc a[href^="javascript"]::after,
            .subSectionDesc a[href^="#"]::after {
                content: none;
            }

            /* Ensure proper page breaks */
            .subSection.detailBox {
                page-break-before: auto;
                page-break-after: auto;
            }

            /* App hub header: keep game name but simplify */
            .apphub_HeaderTop {
                background: none !important;
                padding: 5px 0 !important;
            }

            .apphub_AppName {
                font-size: 14pt !important;
            }

            .apphub_OtherSiteInfo,
            .apphub_HeaderStandardTop_aboutTheGame,
            .apphub_AppIcon {
                display: none !important;
            }

            /* BB code spoiler blocks */
            .bb_spoiler {
                background: none !important;
            }
        }
    `;

    // ===== LIGHT THEME =====
    const lightStyle =
        hideRules +
        `
        @media print {
            body,
            .responsive_page_frame,
            .responsive_page_content,
            .responsive_page_template_content {
                background: white !important;
                color: black !important;
            }

            .workshopItemTitle {
                color: black !important;
            }

            .guideTopDescription {
                color: #333 !important;
            }

            .subSection.detailBox {
                border-bottom: 1px solid #ccc !important;
            }

            .subSectionTitle {
                color: black !important;
            }

            .subSectionDesc {
                color: #222 !important;
            }

            .subSectionDesc a::after {
                color: #666;
            }

            .apphub_AppName {
                color: black !important;
            }

            .bb_spoiler {
                border: 1px solid #ccc !important;
            }

            .bb_spoiler > span {
                color: black !important;
            }
        }
    `;

    // ===== DARK THEME =====
    const darkStyle =
        hideRules +
        `
        @media print {
            body,
            .responsive_page_frame,
            .responsive_page_content,
            .responsive_page_template_content {
                background: #1e1e1e !important;
                color: #d4d4d4 !important;
            }

            .workshopItemTitle {
                color: #e0e0e0 !important;
            }

            .guideTopDescription {
                color: #b0b0b0 !important;
            }

            .subSection.detailBox {
                border-bottom: 1px solid #444 !important;
            }

            .subSectionTitle {
                color: #e0e0e0 !important;
            }

            .subSectionDesc {
                color: #cccccc !important;
            }

            .subSectionDesc a {
                color: #6db3f2 !important;
            }

            .subSectionDesc a::after {
                color: #888;
            }

            .apphub_AppName {
                color: #e0e0e0 !important;
            }

            .bb_spoiler {
                border: 1px solid #555 !important;
            }

            .bb_spoiler > span {
                color: #d4d4d4 !important;
            }
        }
    `;

    // ===== INIT =====
    applyStyle();
    registerMenu();
})();
