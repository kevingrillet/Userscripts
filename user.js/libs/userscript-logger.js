// ==UserScript==
// @name          [Library] Userscript Logger
// @namespace     https://github.com/kevingrillet
// @version       1.01
// @description   Bibliothèque de gestion de logs et notifications pour userscripts Tampermonkey
// @author        Kevin GRILLET
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/libs/userscript-logger.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/libs/userscript-logger.js
// ==/UserScript==

(function (context) {
    'use strict';

    const USLogger = {
        config: {
            scriptName: '[UserScript]',
            logLevel: 'info',
            showTimestamp: true,
            notifyLevel: 'error',
            notifyPosition: 'bottom-right',
            notifyDuration: 5000,
            maxNotifications: 3,
            animate: true,
        },

        levels: {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
            none: 4,
        },

        notificationContainer: null,
        notifications: [],
        notificationQueue: [], // Ajouter cette propriété

        init(config = {}) {
            this.config = { ...this.config, ...config };
            return this;
        },

        debug(...args) {
            this._log('debug', ...args);
        },
        info(...args) {
            this._log('info', ...args);
        },
        warn(...args) {
            this._log('warn', ...args);
        },
        error(error, ...args) {
            if (error instanceof Error) {
                this._log('error', ...args, {
                    error: {
                        message: error.message,
                        stack: error.stack,
                    },
                });
            } else {
                this._log('error', error, ...args);
            }
        },

        _log(level, ...args) {
            if (this.levels[level] < this.levels[this.config.logLevel]) return;

            const prefix = `%c${this.config.scriptName}%c ${level.toUpperCase()}`;
            const styles = ['background: #4285F4; color: white; padding: 2px 4px; border-radius: 2px;', 'background: none; color: inherit;'];

            let logArgs = [...args];
            let errorInfo = null;

            // Extraire les informations d'erreur si présentes
            if (level === 'error' && args.length > 0) {
                const lastArg = args[args.length - 1];
                if (lastArg && lastArg.error) {
                    errorInfo = lastArg.error;
                    logArgs = args.slice(0, -1);
                }
            }

            let timestamp = '';
            if (this.config.showTimestamp) {
                timestamp = new Date().toLocaleTimeString('fr-FR', { hour12: false });
                logArgs.unshift(`[${timestamp}]`);
            }

            // Console log
            console[level](prefix, ...styles, ...logArgs, errorInfo);

            // Notification si niveau suffisant
            if (this.levels[level] >= this.levels[this.config.notifyLevel]) {
                const message = this._formatLogToString(timestamp, level, logArgs);
                this.notify(message, level, {
                    copyable: level === 'error',
                    stack: errorInfo?.stack,
                });
            }
        },

        _formatLogToString(timestamp, level, args) {
            let message = '';

            // Ne pas ajouter le timestamp ici puisqu'il est déjà dans args
            args.forEach((arg, index) => {
                if (index === 0 && typeof arg === 'string' && arg.startsWith('[') && arg.endsWith(']')) {
                    // Skip le premier argument s'il contient déjà le timestamp
                    return;
                }

                if (typeof arg === 'object') {
                    try {
                        message += JSON.stringify(arg, null, 2) + ' ';
                    } catch (e) {
                        message += '[Object] ';
                    }
                } else {
                    message += arg + ' ';
                }
            });

            return message.trim();
        },

        notify(message, type = 'info', options = {}) {
            this._initNotificationSystem();

            // Si on a atteint le maximum de notifications, on met en file d'attente
            if (this.notifications.length >= this.config.maxNotifications) {
                this.notificationQueue.push({ message, type, options });
                return;
            }

            // Afficher immédiatement la notification
            const notification = document.createElement('div');
            notification.className = 'uslogger-notification';
            notification.setAttribute('data-type', type);

            // Structure HTML modifiée
            notification.innerHTML = `
                <div class="uslogger-title">
                    <span>${type.toUpperCase()}</span>
                    <span class="uslogger-timestamp">${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="uslogger-content">
                    <div class="uslogger-message">${message}</div>
                    ${options.stack ? `<pre class="uslogger-stack">${options.stack}</pre>` : ''}
                </div>
                <div class="uslogger-buttons">
                    ${options.copyable ? `<button class="uslogger-button" title="Copier">📋</button>` : ''}
                    <button class="uslogger-button" title="Fermer">×</button>
                </div>
            `;

            // Mise à jour du CSS
            const styles = `
                .uslogger-notification {
                    margin-bottom: 2px !important; /* Réduit de 4px à 2px */
                    border-radius: 2px !important; /* Réduit de 3px à 2px */
                }

                .uslogger-title {
                    padding: 2px 8px !important; /* Réduit de 4px à 2px */
                    font-size: 10px !important; /* Réduit de 11px à 10px */
                    background-color: rgba(0, 0, 0, 0.02) !important; /* Plus léger */
                }

                .uslogger-content {
                    padding: 4px 8px !important; /* Réduit de 6px à 4px */
                    font-size: 11px !important; /* Ajout d'une taille de police plus petite */
                }

                .uslogger-stack {
                    margin-top: 4px !important;
                    padding: 4px !important;
                    background: rgba(0, 0, 0, 0.03) !important;
                    border-radius: 2px !important;
                    font-family: monospace !important;
                    font-size: 11px !important;
                    white-space: pre-wrap !important;
                    max-height: 200px !important;
                    overflow-y: auto !important;
                }

                .uslogger-buttons {
                    padding: 0 4px 4px !important;
                    margin-left: auto !important;
                }

                .uslogger-button {
                    padding: 0 4px !important;
                    font-size: 14px !important;
                    opacity: 0.7 !important;
                }

                .uslogger-button:hover {
                    opacity: 1 !important;
                }
            `;

            // Ajout des styles
            if (!document.getElementById('uslogger-styles-custom')) {
                const styleEl = document.createElement('style');
                styleEl.id = 'uslogger-styles-custom';
                styleEl.textContent = styles;
                document.head.appendChild(styleEl);
            }

            // Gestion du hover
            let timeoutId;
            notification.addEventListener('mouseenter', () => {
                clearTimeout(timeoutId);
            });

            notification.addEventListener('mouseleave', () => {
                if (this.config.notifyDuration > 0) {
                    timeoutId = setTimeout(() => this.close(notification), this.config.notifyDuration);
                }
            });

            this.notificationContainer.appendChild(notification);
            this.notifications.push(notification);

            if (this.config.notifyDuration > 0) {
                timeoutId = setTimeout(() => this.close(notification), this.config.notifyDuration);
            }

            return notification;
        },

        _initNotificationSystem() {
            // Ajout des styles s'ils n'existent pas déjà
            if (!document.getElementById('uslogger-styles')) {
                const style = document.createElement('style');
                style.id = 'uslogger-styles';
                style.textContent = `
                    ${this._getAnimationStyles()}

                    .uslogger-container {
                        position: fixed !important;
                        z-index: 999999 !important;
                        display: flex !important;
                        flex-direction: column-reverse !important;
                        pointer-events: none !important;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
                        max-height: 100vh !important;
                        overflow: hidden !important; /* Enlève la scrollbar */
                        padding: 2px !important; /* Réduit de 4px à 2px */
                        margin: 0 !important; /* Reset margin */
                        box-sizing: border-box !important;
                        width: fit-content !important; /* Ajuste à la largeur du contenu */
                        min-width: 200px !important;
                        max-width: 350px !important;
                    }

                    .uslogger-notification {
                        position: relative !important;
                        color: #333 !important;
                        border-radius: 2px !important; /* Réduit de 3px à 2px */
                        padding: 0 !important;
                        margin: 1px 0 !important; /* Réduit de 2px à 1px et reset les marges horizontales */
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important; /* Réduit l'ombre */
                        font-size: 12px !important;
                        line-height: 1.2 !important; /* Réduit de 1.3 à 1.2 */
                        display: flex !important;
                        flex-direction: column !important; /* Empile les éléments */
                        pointer-events: auto !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                        overflow: hidden !important;
                    }

                    .uslogger-title {
                        padding: 1px 6px !important; /* Réduit de 2px à 1px */
                        font-weight: bold !important;
                        font-size: 10px !important; /* Réduit de 11px à 10px */
                        text-transform: uppercase !important;
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                        background-color: rgba(0, 0, 0, 0.02) !important;
                        border-bottom: 1px solid rgba(0, 0, 0, 0.03) !important; /* Ajoute une légère séparation */
                    }

                    .uslogger-content {
                        padding: 2px 6px !important; /* Réduit de 3px à 2px */
                        flex: 1 !important;
                        display: flex !important;
                        align-items: center !important;
                        min-height: 18px !important; /* Hauteur minimum pour éviter le collapse */
                    }

                    .uslogger-message {
                        flex: 1 !important;
                        margin-right: 4px !important;
                    }

                    .uslogger-buttons {
                        display: flex !important;
                        gap: 2px !important;
                        align-items: center !important;
                        padding: 0 2px 2px !important; /* Réduit les paddings */
                        margin-left: auto !important;
                    }

                    .uslogger-timestamp {
                        font-size: 10px !important;
                        color: #666 !important;
                        font-weight: normal !important;
                    }

                    .uslogger-notification[data-type="error"] {
                        background-color: #FFF5F5 !important;
                        border-left: 3px solid #F44336 !important;
                    }
                    .uslogger-notification[data-type="error"] .uslogger-title {
                        background-color: #FFE8E8 !important;
                    }

                    .uslogger-notification[data-type="warn"] {
                        background-color: #FFF9E6 !important;
                        border-left: 3px solid #FF9800 !important;
                    }
                    .uslogger-notification[data-type="warn"] .uslogger-title {
                        background-color: #FFF3D6 !important;
                    }

                    .uslogger-notification[data-type="info"] {
                        background-color: #F5F9FF !important;
                        border-left: 3px solid #2196F3 !important;
                    }
                    .uslogger-notification[data-type="info"] .uslogger-title {
                        background-color: #EBF3FE !important;
                    }

                    .uslogger-notification[data-type="debug"] {
                        background-color: #F5FFF5 !important;
                        border-left: 3px solid #4CAF50 !important;
                    }
                    .uslogger-notification[data-type="debug"] .uslogger-title {
                        background-color: #EBFEEB !important;
                    }
                `;
                document.head.appendChild(style);
            }

            // Création du conteneur de notifications s'il n'existe pas déjà
            if (!this.notificationContainer) {
                this.notificationContainer = document.createElement('div');
                this.notificationContainer.className = 'uslogger-container';
                this.notificationContainer.style.cssText = this._getPositionStyle();
                document.body.appendChild(this.notificationContainer);
            }
        },

        _getPositionStyle() {
            switch (this.config.notifyPosition) {
                case 'top-left':
                    return 'top: 0; left: 0;';
                case 'top-right':
                    return 'top: 0; right: 0;';
                case 'bottom-left':
                    return 'bottom: 0; left: 0;';
                case 'bottom-right':
                default:
                    return 'bottom: 0; right: 0;';
            }
        },

        _getAnimationStyles() {
            return `
                @keyframes uslogger-fadein {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .uslogger-notification {
                    animation: uslogger-fadein 0.3s ease-out;
                }
            `;
        },

        close(notification) {
            const index = this.notifications.indexOf(notification);
            if (index !== -1) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    notification.remove();
                    this.notifications.splice(index, 1);

                    // Afficher la prochaine notification en attente s'il y en a
                    if (this.notificationQueue.length > 0) {
                        const next = this.notificationQueue.shift();
                        this.notify(next.message, next.type, next.options);
                    }

                    // Supprime le container s'il n'y a plus de notifications et pas d'attente
                    if (this.notifications.length === 0 && this.notificationQueue.length === 0 && this.notificationContainer) {
                        this.notificationContainer.remove();
                        this.notificationContainer = null;
                    }
                }, 300);
            }
        },
    };

    // Expose the library
    context.USLogger = USLogger;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = USLogger;
    }
})(this);
