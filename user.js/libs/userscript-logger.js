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
            if (!this.notificationContainer) {
                this._initNotificationSystem();
            }

            if (this.notifications.length >= this.config.maxNotifications) {
                this.close(this.notifications[0]);
            }

            const notification = document.createElement('div');
            notification.className = 'uslogger-notification';
            notification.style.borderLeft = `4px solid ${this._getTypeColor(type)} !important`;

            const content = document.createElement('div');
            content.className = 'uslogger-content';

            const messageDiv = document.createElement('div');
            messageDiv.className = 'uslogger-message';
            messageDiv.textContent = message;
            content.appendChild(messageDiv);

            if (type === 'error' && options.stack) {
                const stackContainer = document.createElement('div');
                stackContainer.className = 'uslogger-stack';

                const stackTextarea = document.createElement('textarea');
                stackTextarea.value = options.stack;
                stackTextarea.readOnly = true;

                stackContainer.appendChild(stackTextarea);
                content.appendChild(stackContainer);
            }

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'uslogger-buttons';

            if (options.copyable) {
                const copyButton = document.createElement('button');
                copyButton.className = 'uslogger-button';
                copyButton.textContent = '📋';
                copyButton.title = 'Copier';
                copyButton.onclick = () => {
                    const textToCopy = type === 'error' && options.stack ? `${message}\n\nStack Trace:\n${options.stack}` : message;
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        copyButton.textContent = '✓';
                        setTimeout(() => (copyButton.textContent = '📋'), 1000);
                    });
                };
                buttonsDiv.appendChild(copyButton);
            }

            const closeButton = document.createElement('button');
            closeButton.className = 'uslogger-button';
            closeButton.textContent = '×';
            closeButton.title = 'Fermer';
            closeButton.onclick = () => this.close(notification);
            buttonsDiv.appendChild(closeButton);

            notification.appendChild(content);
            notification.appendChild(buttonsDiv);

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

        _createButton(text, title = '') {
            const button = document.createElement('button');
            button.style.cssText = `
                all: initial !important;
                background: none !important;
                border: none !important;
                color: #666 !important;
                font-size: 16px !important;
                cursor: pointer !important;
                padding: 4px 8px !important;
                line-height: 1 !important;
                border-radius: 4px !important;
                transition: background-color 0.2s !important;
                background-color: transparent !important;
            `;
            button.textContent = text;
            button.title = title;

            // Hover effect via classes plutôt que styles inline
            const hoverClass = `${this.cssPrefix}button-hover`;
            if (!document.getElementById(`${this.cssPrefix}styles`)) {
                const style = document.createElement('style');
                style.id = `${this.cssPrefix}styles`;
                style.textContent = `
                    .${hoverClass} {
                        background-color: rgba(0,0,0,0.1) !important;
                    }
                `;
                document.head.appendChild(style);
            }

            button.addEventListener('mouseenter', () => {
                button.classList.add(hoverClass);
            });
            button.addEventListener('mouseleave', () => {
                button.classList.remove(hoverClass);
            });

            return button;
        },

        _getTypeColor(type) {
            switch (type) {
                case 'error':
                    return '#F44336';
                case 'warn':
                    return '#FF9800';
                case 'info':
                    return '#2196F3';
                case 'debug':
                    return '#4CAF50';
                default:
                    return '#2196F3';
            }
        },

        _initNotificationSystem() {
            if (!document.getElementById('uslogger-styles')) {
                const style = document.createElement('style');
                style.id = 'uslogger-styles';
                style.textContent = `
                    .uslogger-container {
                        position: fixed !important;
                        z-index: 999999 !important;
                        display: flex !important;
                        flex-direction: column-reverse !important; /* Inverse l'ordre pour que les nouvelles notifications apparaissent en bas */
                        pointer-events: none !important;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
                        max-height: 100vh !important; /* Limite la hauteur à la hauteur de la fenêtre */
                        overflow-y: auto !important; /* Permet le défilement si nécessaire */
                        padding: 10px !important;
                        box-sizing: border-box !important;
                        width: fit-content !important; /* Ajusté pour s'adapter au contenu */
                        min-width: 200px !important; /* Largeur minimum */
                        max-width: 400px !important; /* Largeur maximum */
                    }

                    .uslogger-notification {
                        position: relative !important;
                        background: white !important;
                        color: #333 !important;
                        border-radius: 4px !important;
                        padding: 8px 12px !important; /* Réduit le padding */
                        margin-bottom: 8px !important;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important;
                        font-size: 13px !important;
                        line-height: 1.4 !important;
                        display: flex !important;
                        align-items: flex-start !important;
                        pointer-events: auto !important;
                        width: fit-content !important; /* Ajusté pour s'adapter au contenu */
                        box-sizing: border-box !important;
                        gap: 8px !important; /* Espace entre le contenu et les boutons */
                    }

                    .uslogger-content {
                        flex: 1 !important;
                        min-width: 0 !important; /* Pour permettre le text-overflow */
                    }

                    .uslogger-message {
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow-wrap: break-word !important;
                        word-wrap: break-word !important;
                    }

                    .uslogger-buttons {
                        display: flex !important;
                        gap: 4px !important;
                        align-items: center !important;
                        margin-left: 8px !important;
                    }

                    .uslogger-button {
                        padding: 2px 6px !important;
                        cursor: pointer !important;
                        color: #666 !important;
                        background: none !important;
                        border: none !important;
                        font-size: 14px !important;
                        line-height: 1 !important;
                        border-radius: 4px !important;
                        z-index: 1000000 !important;
                        pointer-events: auto !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                    }

                    .uslogger-button:hover {
                        background-color: rgba(0, 0, 0, 0.1) !important;
                    }

                    .uslogger-notification[data-type="error"] {
                        border-left: 4px solid #F44336 !important;
                        background-color: #FFF5F5 !important;
                    }

                    .uslogger-notification[data-type="warn"] {
                        border-left: 4px solid #FF9800 !important;
                        background-color: #FFF9E6 !important;
                    }

                    .uslogger-notification[data-type="info"] {
                        border-left: 4px solid #2196F3 !important;
                        background-color: #F5F9FF !important;
                    }

                    .uslogger-notification[data-type="debug"] {
                        border-left: 4px solid #4CAF50 !important;
                        background-color: #F5FFF5 !important;
                    }
                `;
                document.head.appendChild(style);
            }

            this.notificationContainer = document.createElement('div');
            this.notificationContainer.className = 'uslogger-container';
            this.notificationContainer.style.cssText = `
                ${this._getPositionStyle()}
                background: transparent !important;
            `;
            document.body.appendChild(this.notificationContainer);
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
                @keyframes notification-fadein {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .userscript-notification {
                    animation: notification-fadein 0.3s ease-out;
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

                    // Supprime le container s'il n'y a plus de notifications
                    if (this.notifications.length === 0 && this.notificationContainer) {
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
