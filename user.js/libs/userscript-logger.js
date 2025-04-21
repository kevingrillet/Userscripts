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
                    <span>${type.toUpperCase()} - ${new Date().toLocaleTimeString()}</span>
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

                    .uslogger-container {
                        position: fixed;
                        z-index: 999999;
                        display: flex;
                        flex-direction: column-reverse;
                        pointer-events: none;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                        max-height: 100vh;
                        padding: 0; /* Supprime tout padding */
                        margin: 0;
                        box-sizing: border-box;
                        width: 450px;
                        background:transparent;
                    }

                    .uslogger-notification {
                        position: relative;
                        color: #333;
                        border-radius: 2px;
                        padding: 0;
                        margin: 5px;
                        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                        font-size: 12px;
                        line-height: 1.2;
                        display: flex;
                        flex-direction: column;
                        pointer-events: auto;
                        box-sizing: border-box;
                        margin-bottom: 2px;
                        border-radius: 2px;
                    }

                    .uslogger-title {
                        padding: 2px 8px;
                        margin: 0 0 1px 0;
                        font-weight: bold;
                        font-size: 16px;
                        text-transform: uppercase;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .uslogger-content {
                        padding: 3px 8px;
                        margin: 5px 5px 5px 5px;
                        display: block;
                        align-items: center;
                        justify-content: space-between;
                        min-height: 16px;
                    }

                    .uslogger-message {
                        padding: 3px 8px;
                        margin: 0;
                        flex: 1;
                        padding-right: 8px;
                    }

                    .uslogger-buttons {
                        display: flex;
                        gap: 4px;
                        align-items: center;
                        padding: 0;
                        margin: 0;
                        white-space: nowrap;
                        margin-left: auto;
                    }

                    .uslogger-button {
                        cursor: pointer;
                        padding: 0 4px;
                        font-size: 14px;
                        border: none;
                        background: none;
                        opacity: 0.7;
                        line-height: 1;
                        opacity: 0.7;
                    }

                    .uslogger-button:hover {
                        opacity: 1;
                    }

                    .uslogger-stack {
                        margin-top: 4px;
                        padding: 4px;
                        background: rgba(0, 0, 0, 0.03);
                        border-radius: 2px;
                        font-family: monospace;
                        font-size: 11px;
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
