// ==UserScript==
// @name          [NexusMods] Updated Mods Highlighter
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Highlight mods that have been updated since your last download
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       1.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[NexusMods]%20Updated%20Mods%20Highlighter.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[NexusMods]%20Updated%20Mods%20Highlighter.user.js

// @match         https://www.nexusmods.com/*/users/myaccount?tab=download+history*
// @icon          https://www.google.com/s2/favicons?domain=nexusmods.com
// @grant         none
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    // Configuration
    const HIGHLIGHT_STYLE = 'font-weight: bold; background-color: rgba(255, 255, 0, 0.2);'; // Bold text with light yellow background

    // Function to parse date strings from Nexus Mods
    function parseNexusDate(dateString) {
        if (!dateString) return null;

        // Example format: "19 April 2025, 3:39 am"
        const parts = dateString.match(/(\d+)\s+(\w+)\s+(\d+),\s+(\d+):(\d+)\s+(\w+)/);
        if (!parts) return null;

        const day = parseInt(parts[1], 10);
        const month = parts[2];
        const year = parseInt(parts[3], 10);
        let hour = parseInt(parts[4], 10);
        const minute = parseInt(parts[5], 10);
        const ampm = parts[6].toLowerCase();

        // Convert month name to month number (0-based)
        const months = {
            january: 0,
            february: 1,
            march: 2,
            april: 3,
            may: 4,
            june: 5,
            july: 6,
            august: 7,
            september: 8,
            october: 9,
            november: 10,
            december: 11,
        };
        const monthIndex = months[month.toLowerCase()];

        // Adjust hour for PM
        if (ampm === 'pm' && hour < 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;

        return new Date(year, monthIndex, day, hour, minute);
    }

    // Function to check if a mod has been updated since last download
    function isUpdatedSinceDownload(downloadDate, updateDate) {
        const dlDate = parseNexusDate(downloadDate);
        const upDate = parseNexusDate(updateDate);

        if (!dlDate || !upDate) return false;

        // Return true if the update date is more recent than the download date
        return upDate > dlDate;
    }

    // Function to highlight mods updated since last download
    function highlightUpdatedMods() {
        // Get all rows in the download history table except the header row
        const table = document.getElementById('DataTables_Table_0');
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');

        rows.forEach((row) => {
            // Find the "Last DL" column
            const downloadCell = row.querySelector('.table-download');
            // Find the "Updated" column
            const updateCell = row.querySelector('.table-update');
            // Find the mod title container
            const titleContainer = row.querySelector('.tracking-title');

            if (!downloadCell || !updateCell || !titleContainer) return;

            const downloadDate = downloadCell.textContent.trim();
            const updateDate = updateCell.textContent.trim();

            // Check if the mod has been updated since last download
            if (isUpdatedSinceDownload(downloadDate, updateDate)) {
                // Apply highlighting to the entire row
                row.style.cssText = HIGHLIGHT_STYLE;
                // Apply bold style to all links within the row
                row.querySelectorAll('a').forEach(link => {
                    link.style.fontWeight = 'bold';
                });

                // Add indicator before the mod name
                if (!titleContainer.querySelector('.update-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'update-indicator';
                    indicator.style.cssText = 'margin-right: 5px; color: #d60; font-weight: bold;';
                    indicator.textContent = '⚠️'; // Update warning symbol
                    titleContainer.insertBefore(indicator, titleContainer.firstChild);
                }
            } else {
                // Reset styling if not updated
                row.style.cssText = '';
                // Reset link styles
                row.querySelectorAll('a').forEach(link => {
                    link.style.fontWeight = '';
                });

                // Remove the indicator if it exists
                const indicator = titleContainer.querySelector('.update-indicator');
                if (indicator) {
                    indicator.remove();
                }
            }
        });
    }

    // Function to initialize the script and set up event listeners
    function initialize() {
        // Run highlighting initially
        highlightUpdatedMods();

        const table = document.getElementById('DataTables_Table_0');
        if (!table) return;

        // Listen for clicks on table headers
        const headers = table.querySelectorAll('th');
        headers.forEach((header) => {
            header.addEventListener('click', function () {
                // Wait a short time for the table to be sorted before highlighting
                setTimeout(highlightUpdatedMods, 300);
            });
        });

        // Listen for pagination changes
        const pagination = document.querySelector('.dataTables_paginate');
        if (pagination) {
            pagination.addEventListener('click', function (e) {
                if (e.target.tagName === 'A' || e.target.closest('a')) {
                    // Wait a short time for the page to change before highlighting
                    setTimeout(highlightUpdatedMods, 300);
                }
            });
        }

        // Set up MutationObserver to watch for changes in the table body
        const tableBody = table.querySelector('tbody');
        if (tableBody) {
            const observer = new MutationObserver(function (mutations) {
                highlightUpdatedMods();
            });

            observer.observe(tableBody, {
                childList: true,
                subtree: true,
            });
        }

        // Periodically check for updates (in case other methods fail)
        setInterval(highlightUpdatedMods, 2000);
    }

    // If the document is already loaded, initialize immediately
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initialize, 1000);
    } else {
        // Otherwise wait for it to load
        window.addEventListener('DOMContentLoaded', function () {
            setTimeout(initialize, 1000);
        });
    }

    // Also attach to load event as a fallback
    window.addEventListener('load', function () {
        setTimeout(initialize, 1000);
    });
})();
