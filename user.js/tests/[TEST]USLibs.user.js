// ==UserScript==
// @name          /!\ [TEST]USLibs
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Test des librairies USLogger et USConfigManager
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.01

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/tests/[TEST]USLibs.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/tests/[TEST]USLibs.user.js

// @match         https://www.example.com/*
// @icon          https://www.google.com/s2/favicons?domain=example.com
// @require       https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/libs/userscript-config-manager.js
// @require       https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/libs/userscript-logger.js
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_registerMenuCommand
// @run-at        document-end
// ==/UserScript==

(function() {
    'use strict';

    // ==== Test USConfigManager ====
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

    // ==== Test USLogger ====
    // Initialiser le logger avec toutes les options
    USLogger.init({
        scriptName: '[TestLibs]',
        logLevel: 'debug',
        showTimestamp: true,
        notifyLevel: 'debug',
        notifyPosition: 'top-right', // Différent du compteur pour éviter la superposition
        notifyDuration: 8000,
        maxNotifications: 5,
        animate: true
    });

    // Log l'état initial
    USLogger.debug('Configuration initiale:', config);

    // Incrémenter le compteur
    config.visitCount++;
    USConfigManager.set('visitCount', config.visitCount);
    USLogger.info('Compteur incrémenté:', config.visitCount);

    // Créer et afficher le compteur
    function createCounter() {
        if (!config.showCounter) {
            USLogger.warn('Compteur masqué par configuration');
            return;
        }

        try {
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
                cursor: pointer !important;
            `;
            counter.textContent = `Visites: ${config.visitCount}`;
            
            // Ajouter un événement click pour tester les erreurs
            counter.addEventListener('click', () => {
                throw new Error('Test d\'erreur sur clic du compteur');
            });

            document.body.appendChild(counter);
            USLogger.info('Compteur affiché avec succès');
        } catch (error) {
            USLogger.error(error, 'Erreur lors de la création du compteur');
        }
    }

    // Tests supplémentaires des fonctionnalités logger
    function runLoggerTests() {
        USLogger.debug('Test debug:', { version: '0.01' });
        USLogger.info('Test info:', 'Le script est démarré');
        USLogger.warn('Test warn:', 'Attention!');

        try {
            const obj = null;
            obj.impossible();
        } catch (error) {
            USLogger.error(error, 'Erreur avec contexte:', {
                config: config,
                page: window.location.href,
                timestamp: new Date().toISOString()
            });
        }

        USLogger.info('Test objet complexe:', {
            config: config,
            array: [1, 2, 3],
            nested: {
                a: 1,
                b: '2',
                c: true
            },
            date: new Date()
        });
    }

    // Attendre que le document soit prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createCounter();
            runLoggerTests();
        });
    } else {
        createCounter();
        runLoggerTests();
    }
})();