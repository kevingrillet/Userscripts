// ==UserScript==
// @name          /!\ [TEST]USConfigManager
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Experiment about require USConfigManager
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.01

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/lab/[TEST]USConfigManager.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/lab/[TEST]USConfigManager.user.js

// @match         https://example.com/*
// @icon          https://www.google.com/s2/favicons?domain=example.com
// @require       https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/libs/userscript-config-manager.js
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_registerMenuCommand
// @run-at        document-end
// ==/UserScript==

(function() {
    'use strict';

    // Configuration par défaut
    const DEFAULT_CONFIG = {
        visitCount: 0,
        backgroundColor: '#4CAF50',
        showCounter: true
    };

    // Initialiser le gestionnaire de configuration
    const config = USConfigManager.init({
        scriptKey: 'visitCounter',
        scriptName: 'Compteur de visites',
        defaultConfig: DEFAULT_CONFIG
    });

    // Incrémenter le compteur
    config.visitCount++;
    USConfigManager.set('visitCount', config.visitCount);

    // Créer et afficher le compteur
    function createCounter() {
        if (!config.showCounter) return;

        const counter = document.createElement('div');
        counter.style.cssText = `
            all: initial !important;
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            background-color: ${config.backgroundColor} !important;
            color: white !important;
            padding: 10px 15px !important;
            border-radius: 5px !important;
            font-family: Arial, sans-serif !important;
            font-size: 14px !important;
            z-index: 9999 !important;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;
        `;
        counter.textContent = `Visites: ${config.visitCount}`;
        document.body.appendChild(counter);
    }

    // Attendre que le document soit prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createCounter);
    } else {
        createCounter();
    }
})();
