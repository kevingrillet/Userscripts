// ==UserScript==
// @name          /!\ [TEST]USLogger
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Experiment about require USLogger
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.01

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/tests/[TEST]USLogger.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/tests/[TEST]USLogger.user.js

// @match         https://www.example.com/*
// @icon          https://www.google.com/s2/favicons?domain=example.com
// @require       https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/libs/userscript-logger.js
// @grant         none
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    // Initialiser le logger avec toutes les options
    USLogger.init({
        scriptName: '[TEST-USLogger]',
        logLevel: 'debug',
        showTimestamp: true,
        notifyLevel: 'debug', // Afficher toutes les notifications pour le test
        notifyPosition: 'bottom-right',
        notifyDuration: 8000,
        maxNotifications: 5,
        animate: true
    });

    // Test des logs basiques
    USLogger.debug('Test debug:', { version: '0.02' });
    USLogger.info('Test info:', 'Le script est démarré');
    USLogger.warn('Test warn:', 'Attention!');

    // Test des erreurs simples
    USLogger.error('Test error simple:', 'Message d\'erreur');

    // Test des objets Error
    try {
        throw new Error('Erreur simulée pour test');
    } catch (error) {
        USLogger.error(error, 'Contexte de l\'erreur');
    }

    // Test des erreurs avec données additionnelles
    try {
        const obj = null;
        obj.impossible();
    } catch (error) {
        USLogger.error(error, 'Erreur avec contexte:', {
            page: window.location.href,
            timestamp: new Date().toISOString()
        });
    }

    // Test avec objet complexe
    USLogger.info('Test objet complexe:', {
        array: [1, 2, 3],
        nested: {
            a: 1,
            b: '2',
            c: true
        },
        date: new Date()
    });

    // Test de surcharge des notifications
    for (let i = 0; i < 6; i++) {
        USLogger.info(`Test notification #${i + 1}`);
    }
})();
