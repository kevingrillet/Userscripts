// ==UserScript==
// @name          [Steam] Guide Print
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Improves the print layout of Steam Community guides by hiding unnecessary elements and making the guide content full-width
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           steamcommunity.com
// @version       1.0.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Steam]%20Guide%20Print.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Steam]%20Guide%20Print.user.js

// @match         https://steamcommunity.com/sharedfiles/filedetails/?id=*
// @match         https://steamcommunity.com/sharedfiles/filedetails/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=steamcommunity.com
// @grant         GM_addStyle
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    // Only apply on guide pages (check for guide-specific elements)
    if (!document.querySelector('.guide.subSections, .guideTop')) return;

    GM_addStyle(`
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
                background: white !important;
                color: black !important;
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
                color: black !important;
                margin-bottom: 10px !important;
            }

            .guideTopDescription {
                color: #333 !important;
                font-size: 11pt !important;
            }

            /* Guide sub-sections */
            .subSection.detailBox {
                background: none !important;
                border: none !important;
                border-bottom: 1px solid #ccc !important;
                padding: 10px 0 !important;
                margin: 0 !important;
                page-break-inside: avoid;
            }

            .subSectionTitle {
                font-size: 16pt !important;
                font-weight: bold !important;
                color: black !important;
                margin-bottom: 8px !important;
            }

            .subSectionDesc {
                font-size: 11pt !important;
                color: #222 !important;
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
                color: #666;
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
                color: black !important;
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
                border: 1px solid #ccc !important;
            }

            .bb_spoiler > span {
                color: black !important;
            }
        }
    `);
})();
