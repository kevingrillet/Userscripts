// ==UserScript==
// @name          [Library] Userscript Logger
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Bibliothèque de gestion de logs et notifications pour userscripts Tampermonkey
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           library
// @version       1.1

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
            notification.className = 'uslogger-reset uslogger-notification';
            notification.setAttribute('data-type', type);

            // Structure HTML modifiée
            notification.innerHTML = `
                <div class="uslogger-reset uslogger-title">
                    <span class="uslogger-reset">${type.toUpperCase()} - ${new Date().toLocaleTimeString()}</span>
                    <div class="uslogger-reset uslogger-buttons">
                        <button class="uslogger-reset uslogger-button" title="Copier" ${!options.copyable ? 'disabled' : ''}>📋</button>
                        <button class="uslogger-reset uslogger-button" title="Fermer">×</button>
                    </div>
                </div>
                <div class="uslogger-reset uslogger-content">
                    <div class="uslogger-reset uslogger-message">${message}</div>
                    ${options.stack ? `<pre class=" uslogger-stack">${options.stack}</pre>` : ''}
                </div>
            `;

            // Ajout des événements pour les boutons
            const copyButton = notification.querySelector('.uslogger-button[title="Copier"]');
            const closeButton = notification.querySelector('.uslogger-button[title="Fermer"]');

            copyButton.addEventListener('click', () => {
                if (options.copyable) {
                    const textToCopy = options.stack ? `${message}\n\n${options.stack}` : message;
                    navigator.clipboard.writeText(textToCopy).catch(console.error);
                }
            });

            closeButton.addEventListener('click', () => {
                this.close(notification);
            });

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
            if (!document.getElementById('uslogger-styles')) {
                const style = document.createElement('style');
                style.id = 'uslogger-styles';
                style.textContent = `
                    ${this._getAnimationStyles()}

                    .uslogger-reset{
                        all: unset;
                    }

                    .uslogger-container {
                        position: fixed;
                        z-index: 999999;
                        display: flex;
                        flex-direction: column-reverse;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                        color: rgb(0, 0, 0);
                        max-height: 100vh;
                        padding: 4px;
                        margin: 0;
                        box-sizing: border-box;
                        width: 350px;
                        background:transparent;
                    }

                    .uslogger-notification {
                        position: relative;
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        margin: 0 0 4px 0;
                        box-sizing: border-box;
                        overflow: visible;
                        padding: 0;
                    }

                    .uslogger-title {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-weight: bold;
                        font-size: 16px;
                        text-transform: uppercase;
                        padding: 4px 8px;
                        margin: 0;
                        min-height: 24px;
                        background: inherit;
                        white-space: nowrap;
                    }

                    .uslogger-buttons {
                        margin-left: auto;
                        margin-top: 0;
                        margin-bottom: 0;
                        padding: 0;
                        background: transparent;
                        white-space: nowrap;
                    }

                    .uslogger-button {
                        cursor: pointer;
                        padding: 0 4px;
                        font-size: 14px;
                        border: none;
                        background: transparent;
                        opacity: 0.7;
                        line-height: 1;
                        color: inherit;
                    }

                    .uslogger-button:disabled {
                        opacity: 0.3;
                        cursor: not-allowed;
                    }

                    .uslogger-button:not(:disabled):hover {
                        opacity: 1;
                    }

                    .uslogger-content {
                        padding: 5px;
                        font-size: 12px;
                        margin: 5px;
                        background: transparent;
                    }

                    .uslogger-message {
                        margin: 0;
                        padding: 0;
                        word-break: break-word;
                        background: transparent;
                        color: rgb(0, 0, 0);
                    }

                    .uslogger-stack {
                        margin-top: 4px;
                        padding: 4px;
                        background: rgba(0, 0, 0, 0.03);
                        border-radius: 2px;
                        font-family: monospace;
                        font-size: 11px;
                        color: rgb(0, 0, 0);
                        white-space: pre-wrap;
                        max-height: 200px;
                        overflow-y: auto;
                    }

                    .uslogger-notification[data-type="error"] {
                        background-color: #FFF5F5;
                        border-left: 3px solid #F44336;
                    }
                    .uslogger-notification[data-type="error"] .uslogger-title {
                        background-color: #FFE8E8;
                    }

                    .uslogger-notification[data-type="warn"] {
                        background-color: #FFF9E6;
                        border-left: 3px solid #FF9800;
                    }
                    .uslogger-notification[data-type="warn"] .uslogger-title {
                        background-color: #FFF3D6;
                    }

                    .uslogger-notification[data-type="info"] {
                        background-color: #F5F9FF;
                        border-left: 3px solid #2196F3;
                    }
                    .uslogger-notification[data-type="info"] .uslogger-title {
                        background-color: #EBF3FE;
                    }

                    .uslogger-notification[data-type="debug"] {
                        background-color: #F5FFF5;
                        border-left: 3px solid #4CAF50;
                    }
                    .uslogger-notification[data-type="debug"] .uslogger-title {
                        background-color: #EBFEEB;
                    }
                `;
                document.head.appendChild(style);
            }

            // Création du conteneur de notifications s'il n'existe pas déjà
            if (!this.notificationContainer) {
                this.notificationContainer = document.createElement('div');
                this.notificationContainer.className = 'uslogger-reset uslogger-container';
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
