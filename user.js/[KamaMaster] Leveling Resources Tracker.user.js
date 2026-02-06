// ==UserScript==
// @name          [KamaMaster] Leveling Resources Tracker
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Affiche un tableau récapitulatif des ressources à acheter pour le leveling sur KamaMaster
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           kamamaster.fr
// @version       1.0.0
//
// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[KamaMaster]%20Leveling%20Resources%20Tracker.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[KamaMaster]%20Leveling%20Resources%20Tracker.user.js
//
// @match         https://kamamaster.fr/*/calculateur-leveling
// @icon          https://www.google.com/s2/favicons?sz=64&domain=kamamaster.fr
// @grant         GM_setClipboard
// @grant         GM_addStyle
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    // ========== CONFIGURATION ==========
    const CONFIG = {
        UPDATE_INTERVAL: 500, // Vérification des changements toutes les 500ms
        CONTAINER_ID: 'km-resources-tracker',
        LOGGER_PREFIX: '[KamaMaster Resources]',
    };

    // ========== STYLES ==========
    GM_addStyle(`
        #${CONFIG.CONTAINER_ID} {
            position: fixed;
            top: 100px;
            right: 20px;
            width: 350px;
            max-height: calc(100vh - 120px);
            background: linear-gradient(135deg, var(--background-color-2), var(--background-color-3));
            border: 2px solid var(--border-color);
            border-radius: 12px;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
            overflow: hidden;
            z-index: 9999;
            font-family: Inter, Roboto, sans-serif;
            color: var(--color-1);
        }

        #${CONFIG.CONTAINER_ID}-header {
            background: linear-gradient(135deg, #FFC107, #FF9800);
            padding: 15px;
            text-align: center;
            font-weight: 700;
            font-size: 1.1rem;
            color: var(--background-color);
            border-bottom: 2px solid var(--border-color);
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        #${CONFIG.CONTAINER_ID}-content {
            max-height: calc(100vh - 220px);
            overflow-y: auto;
            padding: 15px;
        }

        #${CONFIG.CONTAINER_ID}-content::-webkit-scrollbar {
            width: 8px;
        }

        #${CONFIG.CONTAINER_ID}-content::-webkit-scrollbar-track {
            background: var(--background-color-2);
            border-radius: 4px;
        }

        #${CONFIG.CONTAINER_ID}-content::-webkit-scrollbar-thumb {
            background: var(--color-hover);
            border-radius: 4px;
        }

        #${CONFIG.CONTAINER_ID}-content::-webkit-scrollbar-thumb:hover {
            background: var(--color-hover-2);
        }

        .km-resource-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px;
            margin-bottom: 8px;
            background: var(--background-color-4);
            border-radius: 8px;
            transition: all 0.3s ease;
            cursor: pointer;
            border: 1px solid transparent;
        }

        .km-resource-row:hover {
            background: var(--background-color-3);
            border-color: var(--color-hover);
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
            transform: translateX(-3px);
        }

        .km-resource-row.purchased {
            opacity: 0.4;
            background: var(--background-color-2);
            border-color: transparent;
        }

        .km-resource-row.purchased:hover {
            opacity: 0.6;
        }

        .km-resource-row.purchased .km-resource-name {
            text-decoration: line-through;
            color: var(--color-2);
        }

        .km-resource-row.purchased .km-resource-img {
            filter: grayscale(100%);
        }

        .km-resource-img {
            width: 48px;
            height: 48px;
            border-radius: 6px;
            flex-shrink: 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }

        .km-resource-info {
            flex-grow: 1;
            min-width: 0;
        }

        .km-resource-name {
            font-weight: 600;
            font-size: 0.95rem;
            color: var(--color-1);
            margin-bottom: 4px;
            word-wrap: break-word;
            line-height: 1.2;
        }

        .km-resource-quantity {
            font-size: 0.85rem;
            color: var(--color-2);
        }

        .km-resource-quantity-value {
            color: var(--color-hover);
            font-weight: 700;
        }

        .km-empty-message {
            text-align: center;
            padding: 40px 20px;
            color: var(--color-2);
            font-size: 1rem;
        }

        .km-copy-notification {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: var(--success-color);
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 1.1rem;
            z-index: 10000;
            box-shadow: 0 0 20px rgba(50, 205, 50, 0.5);
            animation: fadeInOut 2s ease-in-out;
        }

        @keyframes fadeInOut {
            0%, 100% { opacity: 0; }
            10%, 90% { opacity: 1; }
        }

        .km-total-cost {
            padding: 15px;
            background: var(--background-color-4);
            border-top: 2px solid var(--border-color);
            text-align: center;
            font-weight: 700;
            font-size: 1rem;
        }

        .km-total-cost-value {
            color: var(--color-hover);
            font-size: 1.2rem;
        }
    `);

    // ========== LOGGER ==========
    const Logger = {
        log: (...args) => console.log(CONFIG.LOGGER_PREFIX, ...args),
        warn: (...args) => console.warn(CONFIG.LOGGER_PREFIX, ...args),
        error: (...args) => console.error(CONFIG.LOGGER_PREFIX, ...args),
    };

    // ========== RESOURCE TRACKER ==========
    class ResourceTracker {
        constructor() {
            this.resources = new Map();
            this.totalCost = '';
            this.container = null;
            this.observer = null;
            this.purchasedResources = new Set();
        }

        init() {
            Logger.log('Initializing Resource Tracker...');
            this.createContainer();
            this.startObserver();
            this.updateResources();
        }

        createContainer() {
            // Créer le conteneur principal
            this.container = document.createElement('div');
            this.container.id = CONFIG.CONTAINER_ID;

            // Header
            const header = document.createElement('div');
            header.id = `${CONFIG.CONTAINER_ID}-header`;
            header.innerHTML = '📦 Ressources à acheter';

            // Content
            const content = document.createElement('div');
            content.id = `${CONFIG.CONTAINER_ID}-content`;

            // Total
            const totalCost = document.createElement('div');
            totalCost.className = 'km-total-cost';
            totalCost.innerHTML = '<span class="km-total-cost-value">Calculez pour voir le total</span>';

            this.container.appendChild(header);
            this.container.appendChild(content);
            this.container.appendChild(totalCost);

            document.body.appendChild(this.container);
            Logger.log('Container created');
        }

        startObserver() {
            // Observer pour détecter les changements dans le tableau
            const targetNode = document.body;
            const config = { childList: true, subtree: true };

            this.observer = new MutationObserver(() => {
                this.updateResources();
            });

            this.observer.observe(targetNode, config);
            Logger.log('Observer started');
        }

        extractResources() {
            const resourcesMap = new Map();

            // Sélectionner toutes les lignes du tableau de résultats
            const rows = document.querySelectorAll('tbody tr');

            rows.forEach((row) => {
                // Trouver tous les items de ressources dans cette ligne
                const resourceItems = row.querySelectorAll('.resource-item');

                resourceItems.forEach((item) => {
                    // Extraire la quantité
                    const quantityElement = item.querySelector('.resource-quantity');
                    const quantity = quantityElement ? parseInt(quantityElement.textContent.trim()) : 0;

                    // Extraire l'image
                    const imgElement = item.querySelector('.material-icon');
                    const imgSrc = imgElement ? imgElement.src : '';

                    // Extraire le nom et le prix depuis le span
                    const nameElement = item.querySelector('.resource-name');
                    if (!nameElement) return;

                    const fullText = nameElement.textContent.trim();
                    // Format: "Nom de la ressource - 123K"
                    const match = fullText.match(/^(.+?)\s*-\s*(.+?)$/);

                    if (!match) return;

                    const resourceName = match[1].trim();
                    const resourcePrice = match[2].trim();

                    // Ajouter ou mettre à jour la ressource
                    if (resourcesMap.has(resourceName)) {
                        const existing = resourcesMap.get(resourceName);
                        existing.quantity += quantity;
                    } else {
                        resourcesMap.set(resourceName, {
                            name: resourceName,
                            quantity: quantity,
                            image: imgSrc,
                            price: resourcePrice,
                        });
                    }
                });
            });

            return resourcesMap;
        }

        extractTotalCost() {
            // Extraire le coût total depuis le paragraphe "Total estimé"
            const totalElement = document.querySelector('.calculator-container p strong');
            return totalElement ? totalElement.textContent.trim() : '';
        }

        updateResources() {
            const newResources = this.extractResources();
            const newTotal = this.extractTotalCost();

            // Vérifier si les ressources ont changé
            if (this.hasResourcesChanged(newResources) || this.totalCost !== newTotal) {
                this.resources = newResources;
                this.totalCost = newTotal;
                this.render();
                Logger.log('Resources updated:', this.resources.size, 'items');
            }
        }

        hasResourcesChanged(newResources) {
            if (this.resources.size !== newResources.size) return true;

            for (const [name, data] of newResources) {
                const existing = this.resources.get(name);
                if (!existing || existing.quantity !== data.quantity) {
                    return true;
                }
            }

            return false;
        }

        render() {
            const content = document.getElementById(`${CONFIG.CONTAINER_ID}-content`);
            const totalCostDiv = this.container.querySelector('.km-total-cost');

            if (!content) return;

            // Effacer le contenu
            content.innerHTML = '';

            // Si pas de ressources
            if (this.resources.size === 0) {
                content.innerHTML = '<div class="km-empty-message">🎯 Lancez un calcul pour voir les ressources</div>';
                totalCostDiv.innerHTML = '<span class="km-total-cost-value">Calculez pour voir le total</span>';
                return;
            }

            // Trier les ressources par quantité décroissante
            const sortedResources = Array.from(this.resources.values()).sort((a, b) => b.quantity - a.quantity);

            // Créer les lignes de ressources
            sortedResources.forEach((resource) => {
                const row = document.createElement('div');
                row.className = 'km-resource-row';
                row.title = 'Clic: marquer comme acheté • Shift+Clic: copier le nom';

                row.innerHTML = `
                    <img src="${resource.image}" alt="${resource.name}" class="km-resource-img">
                    <div class="km-resource-info">
                        <div class="km-resource-name">${resource.name}</div>
                        <div class="km-resource-quantity">
                            Quantité: <span class="km-resource-quantity-value">${resource.quantity}</span>
                        </div>
                    </div>
                `;

                // Marquer comme achetée si dans le Set
                if (this.purchasedResources.has(resource.name)) {
                    row.classList.add('purchased');
                }

                row.addEventListener('click', (e) => {
                    if (e.shiftKey) {
                        this.copyToClipboard(resource.name);
                    } else {
                        this.togglePurchased(resource.name, row, e);
                    }
                });
                content.appendChild(row);
            });

            // Mettre à jour le total
            totalCostDiv.innerHTML = `
                Total estimé: <span class="km-total-cost-value">${this.totalCost || 'N/A'}</span>
            `;
        }

        togglePurchased(resourceName, rowElement, event) {
            // Toggle l'état acheté/non-acheté
            if (this.purchasedResources.has(resourceName)) {
                this.purchasedResources.delete(resourceName);
                rowElement.classList.remove('purchased');
                Logger.log('Marked as NOT purchased:', resourceName);
            } else {
                this.purchasedResources.add(resourceName);
                rowElement.classList.add('purchased');
                Logger.log('Marked as purchased:', resourceName);
            }

            // Empêcher la copie lors du toggle
            event.stopPropagation();
        }

        copyToClipboard(text) {
            GM_setClipboard(text);
            this.showCopyNotification(text);
            Logger.log('Copied to clipboard:', text);
        }

        showCopyNotification(text) {
            const notification = document.createElement('div');
            notification.className = 'km-copy-notification';
            notification.textContent = `✓ ${text} copié !`;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 2000);
        }
    }

    // ========== INITIALIZATION ==========
    const tracker = new ResourceTracker();

    // Attendre que le DOM soit complètement chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => tracker.init());
    } else {
        tracker.init();
    }

    Logger.log('Script loaded successfully');
})();
