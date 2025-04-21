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
            notification.setAttribute('data-type', type);

            // Ajoute le titre
            const title = document.createElement('div');
            title.className = 'uslogger-title';
            const typeText = document.createElement('span');
            typeText.textContent = type.toUpperCase();
            const timestamp = document.createElement('span');
            timestamp.className = 'uslogger-timestamp';
            timestamp.textContent = new Date().toLocaleTimeString('fr-FR', { hour12: false });
            title.appendChild(typeText);
            title.appendChild(timestamp);
            notification.appendChild(title);

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

        _initNotificationSystem() {
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
                        padding: 8px !important;
                        box-sizing: border-box !important;
                        width: fit-content !important; /* Ajuste à la largeur du contenu */
                        min-width: 200px !important;
                        max-width: 350px !important;
                    }

                    .uslogger-notification {
                        position: relative !important;
                        color: #333 !important;
                        border-radius: 3px !important;
                        padding: 0 !important; /* Reset padding */
                        margin-bottom: 4px !important;
                        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1) !important;
                        font-size: 12px !important;
                        line-height: 1.3 !important;
                        display: flex !important;
                        flex-direction: column !important; /* Empile les éléments */
                        pointer-events: auto !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                        overflow: hidden !important;
                    }

                    .uslogger-title {
                        padding: 4px 8px !important;
                        font-weight: bold !important;
                        font-size: 11px !important;
                        text-transform: uppercase !important;
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                        background-color: rgba(0, 0, 0, 0.03) !important;
                    }

                    .uslogger-content {
                        padding: 6px 8px !important;
                        flex: 1 !important;
                        display: flex !important;
                        align-items: center !important;
                    }

                    .uslogger-message {
                        flex: 1 !important;
                        margin-right: 4px !important;
                    }

                    .uslogger-buttons {
                        display: flex !important;
                        gap: 2px !important;
                        align-items: center !important;
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
