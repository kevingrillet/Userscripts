// ==UserScript==
// @name          [Library] Config Manager
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Bibliothèque de gestion de configuration pour userscripts
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           library
// @version       1.0

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/libs/userscript-config-manager.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/libs/userscript-config-manager.js
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_registerMenuCommand
// ==/UserScript==

(function (context) {
    'use strict';

    // Gestionnaire de configuration pour userscripts
    const USConfigManager = {
        // Clé de stockage des configurations
        storageKey: 'userscript_config',

        // Nom du script pour l'affichage
        scriptName: 'UserScript',

        // Configuration par défaut
        defaultConfig: {},

        // Configuration actuelle
        config: {},

        // Préfixe pour les classes CSS (pour éviter les collisions)
        cssPrefix: 'cfg-mgr-',

        // Initialiser la configuration
        init(options) {
            const { scriptKey, defaultConfig, scriptName = scriptKey, registerMenu = true } = options;

            if (!scriptKey) throw new Error('scriptKey est requis pour initialiser USConfigManager');

            this.storageKey = `${scriptKey}_config`;
            this.scriptName = scriptName;
            this.defaultConfig = defaultConfig || {};
            this.cssPrefix = `cfgmgr-${scriptKey.toLowerCase().replace(/[^a-z0-9]/g, '-')}-`;
            this.load();

            // Enregistrer la commande de menu pour accéder à la configuration
            if (registerMenu && typeof GM_registerMenuCommand !== 'undefined') {
                GM_registerMenuCommand(`Configurer ${this.scriptName}`, () => this.showConfigDialog());
            }

            return this.config;
        },

        // Charger la configuration
        load() {
            try {
                const savedConfig = typeof GM_getValue !== 'undefined' ? GM_getValue(this.storageKey, null) : localStorage.getItem(this.storageKey);

                if (savedConfig) {
                    const parsedConfig = JSON.parse(savedConfig);
                    this.config = { ...this.defaultConfig, ...parsedConfig };
                } else {
                    this.config = { ...this.defaultConfig };
                    this.save(); // Sauvegarder la configuration par défaut
                }
            } catch (error) {
                console.error('Erreur lors du chargement de la configuration:', error);
                this.config = { ...this.defaultConfig };
            }

            return this.config;
        },

        // Sauvegarder la configuration
        save() {
            try {
                const configStr = JSON.stringify(this.config);

                if (typeof GM_setValue !== 'undefined') {
                    GM_setValue(this.storageKey, configStr);
                } else {
                    localStorage.setItem(this.storageKey, configStr);
                }

                return true;
            } catch (error) {
                console.error('Erreur lors de la sauvegarde de la configuration:', error);
                return false;
            }
        },

        // Mettre à jour une valeur spécifique
        set(key, value) {
            this.config[key] = value;
            return this.save();
        },

        // Récupérer une valeur spécifique
        get(key, defaultValue = null) {
            return key in this.config ? this.config[key] : defaultValue;
        },

        // Réinitialiser la configuration
        reset() {
            this.config = { ...this.defaultConfig };
            return this.save();
        },

        // Créer un champ selon le type de valeur
        // Fonction corrigée pour créer un champ selon le type de valeur
        _createField(key, value) {
            const formGroup = document.createElement('div');
            formGroup.className = `${this.cssPrefix}form-group`;

            // Formater le label (camelCase vers texte lisible)
            const labelText = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

            // Input field based on type
            let input;
            let labelContainer;

            if (typeof value === 'boolean') {
                // Pour les booléens, créer un conteneur spécial pour le label et la checkbox
                labelContainer = document.createElement('div');
                labelContainer.className = `${this.cssPrefix}checkbox-container`;

                // Créer la checkbox
                input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = value;
                input.className = `${this.cssPrefix}checkbox`;
                input.id = `${this.cssPrefix}${key}`;
                input.name = key;
                input.setAttribute('data-key', key);

                // Créer le label à côté de la checkbox
                const label = document.createElement('label');
                label.textContent = labelText;
                label.className = `${this.cssPrefix}checkbox-label`;
                label.htmlFor = `${this.cssPrefix}${key}`;

                // Ajouter la checkbox puis le label au conteneur
                labelContainer.appendChild(input);
                labelContainer.appendChild(label);

                // Ajouter le conteneur au groupe de formulaire
                formGroup.appendChild(labelContainer);
            } else {
                // Pour les autres types, garder le label au-dessus
                const label = document.createElement('label');
                label.textContent = labelText;
                label.className = `${this.cssPrefix}label`;
                label.htmlFor = `${this.cssPrefix}${key}`;
                formGroup.appendChild(label);

                if (typeof value === 'number') {
                    input = document.createElement('input');
                    input.type = 'number';
                    input.value = value;
                    input.step = 'any';
                    input.className = `${this.cssPrefix}input ${this.cssPrefix}number`;
                } else if (Array.isArray(value)) {
                    input = document.createElement('textarea');
                    input.value = value.join('\n');
                    input.rows = Math.min(value.length + 1, 5);
                    input.className = `${this.cssPrefix}textarea`;
                } else {
                    input = document.createElement('input');
                    input.type = 'text';
                    input.value = value;
                    input.className = `${this.cssPrefix}input ${this.cssPrefix}text`;
                }

                input.id = `${this.cssPrefix}${key}`;
                input.name = key;
                input.setAttribute('data-key', key);

                formGroup.appendChild(input);
            }

            return formGroup;
        },

        // Injecter les styles CSS avec un reset complet
        _injectStyles() {
            const styles = `
                /* Reset pour tous les éléments de la boîte de dialogue */
                .${this.cssPrefix}overlay, .${this.cssPrefix}dialog, .${this.cssPrefix}dialog *,
                .${this.cssPrefix}title, .${this.cssPrefix}form-group, .${this.cssPrefix}label,
                .${this.cssPrefix}input, .${this.cssPrefix}checkbox, .${this.cssPrefix}textarea,
                .${this.cssPrefix}text, .${this.cssPrefix}number, .${this.cssPrefix}buttons,
                .${this.cssPrefix}button, .${this.cssPrefix}save, .${this.cssPrefix}cancel,
                .${this.cssPrefix}reset {
                    all: initial;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    box-sizing: border-box !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    line-height: normal !important;
                    text-shadow: none !important;
                    box-shadow: none !important;
                    text-transform: none !important;
                    letter-spacing: normal !important;
                    word-spacing: normal !important;
                    pointer-events: auto !important;
                    text-decoration: none !important;
                    color: #333 !important;
                    font-size: 14px !important;
                }

                /* Overlay */
                .${this.cssPrefix}overlay {
                    display: block !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    background: rgba(0, 0, 0, 0.5) !important;
                    z-index: 2147483646 !important; /* Juste en dessous de la dialog */
                }

                /* Boite de dialogue principale */
                .${this.cssPrefix}dialog {
                    display: block !important;
                    position: fixed !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    background: white !important;
                    border: 1px solid #ccc !important;
                    border-radius: 8px !important;
                    padding: 20px !important;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3) !important;
                    z-index: 2147483647 !important; /* Maximum z-index */
                    width: min(90%, 500px) !important;
                    max-height: 80vh !important;
                    overflow-y: auto !important;
                }

                /* Titre */
                .${this.cssPrefix}title {
                    display: block !important;
                    font-size: 18px !important;
                    font-weight: bold !important;
                    margin: 0 0 20px 0 !important;
                    padding: 0 !important;
                    color: #333 !important;
                    border-bottom: 1px solid #eee !important;
                    padding-bottom: 10px !important;
                    width: 100% !important;
                }

                /* Groupes de formulaire */
                .${this.cssPrefix}form-group {
                    display: block !important;
                    margin: 15px 0 !important;
                    width: 100% !important;
                }

                /* Labels */
                .${this.cssPrefix}label {
                    display: block !important;
                    margin-bottom: 5px !important;
                    font-weight: 500 !important;
                    color: #333 !important;
                }

                /* Inputs génériques */
                .${this.cssPrefix}input {
                    display: block !important;
                    width: 100% !important;
                    padding: 8px 12px !important;
                    border: 1px solid #ccc !important;
                    border-radius: 4px !important;
                    font-size: 14px !important;
                    color: #333 !important;
                    background: white !important;
                    margin-top: 5px !important;
                }

                /* Textarea */
                .${this.cssPrefix}textarea {
                    display: block !important;
                    width: 100% !important;
                    padding: 8px 12px !important;
                    border: 1px solid #ccc !important;
                    border-radius: 4px !important;
                    font-size: 14px !important;
                    color: #333 !important;
                    resize: vertical !important;
                    min-height: 80px !important;
                    background: white !important;
                    font-family: monospace !important;
                    margin-top: 5px !important;
                }

                /* Conteneur pour checkbox et son label */
                .${this.cssPrefix}checkbox-container {
                    display: flex !important;
                    align-items: center !important;
                    margin: 5px 0 !important;
                }

                /* Checkbox */
                .${this.cssPrefix}checkbox {
                    display: inline-block !important;
                    width: auto !important;
                    height: auto !important;
                    margin: 0 8px 0 0 !important;
                    padding: 0 !important;
                    vertical-align: middle !important;
                    appearance: checkbox !important;
                    -webkit-appearance: checkbox !important;
                    -moz-appearance: checkbox !important;
                    position: relative !important;
                }

                /* Label pour les checkboxes */
                .${this.cssPrefix}checkbox-label {
                    display: inline-block !important;
                    font-weight: normal !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    color: #333 !important;
                    cursor: pointer !important;
                }

                /* Container pour les boutons */
                .${this.cssPrefix}buttons {
                    display: flex !important;
                    justify-content: space-between !important;
                    margin-top: 20px !important;
                    width: 100% !important;
                    border-top: 1px solid #eee !important;
                    padding-top: 15px !important;
                }

                /* Style des boutons */
                .${this.cssPrefix}button {
                    display: inline-block !important;
                    padding: 8px 16px !important;
                    cursor: pointer !important;
                    border: 1px solid #ccc !important;
                    background: #f5f5f5 !important;
                    border-radius: 4px !important;
                    color: #333 !important;
                    font-size: 14px !important;
                    text-align: center !important;
                    min-width: 80px !important;
                }

                .${this.cssPrefix}button:hover {
                    background: #e5e5e5 !important;
                }

                .${this.cssPrefix}save {
                    background: #4CAF50 !important;
                    color: white !important;
                    border-color: #4CAF50 !important;
                }

                .${this.cssPrefix}save:hover {
                    background: #45a049 !important;
                }

                .${this.cssPrefix}reset {
                    background: #f44336 !important;
                    color: white !important;
                    border-color: #f44336 !important;
                }

                .${this.cssPrefix}reset:hover {
                    background: #da3c30 !important;
                }
            `;

            // Utiliser GM_addStyle si disponible, sinon créer un élément style
            if (typeof GM_addStyle !== 'undefined') {
                GM_addStyle(styles);
                return null;
            } else {
                const styleEl = document.createElement('style');
                styleEl.textContent = styles;
                document.head.appendChild(styleEl);
                return styleEl;
            }
        },

        // Afficher une boîte de dialogue de configuration
        showConfigDialog() {
            // Injecter les styles sécurisés
            const styleEl = this._injectStyles();

            // Créer un élément overlay
            const overlay = document.createElement('div');
            overlay.className = `${this.cssPrefix}overlay`;

            // Créer un élément de dialogue
            const dialog = document.createElement('div');
            dialog.className = `${this.cssPrefix}dialog`;

            // Titre
            const title = document.createElement('h2');
            title.textContent = `Configuration de ${this.scriptName}`;
            title.className = `${this.cssPrefix}title`;
            dialog.appendChild(title);

            // Créer un formulaire pour chaque option
            const form = document.createElement('form');
            form.className = `${this.cssPrefix}form`;
            form.addEventListener('submit', (e) => e.preventDefault());

            // Trier les clés par ordre alphabétique
            const sortedKeys = Object.keys(this.config).sort();

            for (const key of sortedKeys) {
                const value = this.config[key];
                const field = this._createField(key, value);
                form.appendChild(field);
            }

            dialog.appendChild(form);

            // Boutons
            const buttonContainer = document.createElement('div');
            buttonContainer.className = `${this.cssPrefix}buttons`;

            const saveButton = document.createElement('button');
            saveButton.textContent = 'Enregistrer';
            saveButton.className = `${this.cssPrefix}button ${this.cssPrefix}save`;
            saveButton.type = 'button';

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Annuler';
            cancelButton.className = `${this.cssPrefix}button ${this.cssPrefix}cancel`;
            cancelButton.type = 'button';

            const resetButton = document.createElement('button');
            resetButton.textContent = 'Réinitialiser';
            resetButton.className = `${this.cssPrefix}button ${this.cssPrefix}reset`;
            resetButton.type = 'button';

            buttonContainer.appendChild(saveButton);
            buttonContainer.appendChild(cancelButton);
            buttonContainer.appendChild(resetButton);
            dialog.appendChild(buttonContainer);

            // Ajouter les éléments au document
            document.body.appendChild(overlay);
            document.body.appendChild(dialog);

            // Fonctions de gestion des événements
            const closeDialog = () => {
                dialog.remove();
                overlay.remove();
                if (styleEl) styleEl.remove();
            };

            saveButton.addEventListener('click', () => {
                // Sauvegarder les nouvelles valeurs
                for (const key of sortedKeys) {
                    const value = this.config[key];
                    const input = document.getElementById(`${this.cssPrefix}${key}`);

                    if (typeof value === 'boolean') {
                        this.config[key] = input.checked;
                    } else if (typeof value === 'number') {
                        this.config[key] = parseFloat(input.value);
                    } else if (Array.isArray(value)) {
                        // Convertir les lignes du textarea en tableau
                        this.config[key] = input.value.split('\n').filter((line) => line.trim() !== '');
                    } else {
                        this.config[key] = input.value;
                    }
                }

                this.save();
                closeDialog();

                // Demander si on veut recharger la page
                if (confirm('Configuration enregistrée. Recharger la page pour appliquer les changements?')) {
                    location.reload();
                }
            });

            cancelButton.addEventListener('click', closeDialog);

            resetButton.addEventListener('click', () => {
                if (confirm('Réinitialiser la configuration aux valeurs par défaut?')) {
                    this.reset();
                    closeDialog();
                    location.reload();
                }
            });

            overlay.addEventListener('click', closeDialog);
        },
    };

    // Expose the library
    context.USConfigManager = USConfigManager;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = USConfigManager;
    }
})(this);
