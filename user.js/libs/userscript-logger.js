// ==UserScript==
// @name          [Library] Userscript Logger
// @namespace     https://github.com/kevingrillet
// @version       1.02
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
            if (timestamp) message += `[${timestamp}] `;

            args.forEach((arg) => {
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
            // Créer les styles globaux une seule fois
            if (!document.getElementById('uslogger-styles')) {
                const style = document.createElement('style');
                style.id = 'uslogger-styles';
                style.textContent = `
                    .uslogger-container {
                        position: fixed !important;
                        z-index: 999999 !important;
                        display: flex !important;
                        flex-direction: column !important;
                        pointer-events: none !important;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
                    }

                    .uslogger-notification {
                        position: relative !important;
                        background: white !important;
                        color: #333 !important;
                        border-radius: 4px !important;
                        padding: 12px 16px !important;
                        margin: 10px !important;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important;
                        max-width: 400px !important;
                        font-size: 14px !important;
                        line-height: 1.4 !important;
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: flex-start !important;
                        pointer-events: auto !important;
                    }

                    .uslogger-content {
                        flex: 1 !important;
                        margin-right: 10px !important;
                    }

                    .uslogger-message {
                        margin-bottom: 8px !important;
                    }

                    .uslogger-stack {
                        margin-top: 8px !important;
                    }

                    .uslogger-stack textarea {
                        width: 100% !important;
                        height: 100px !important;
                        padding: 8px !important;
                        border: 1px solid #ddd !important;
                        border-radius: 4px !important;
                        font-family: monospace !important;
                        font-size: 12px !important;
                        resize: vertical !important;
                        background: #f5f5f5 !important;
                        color: #333 !important;
                    }

                    .uslogger-buttons {
                        display: flex !important;
                        gap: 5px !important;
                    }

                    .uslogger-button {
                        padding: 4px 8px !important;
                        cursor: pointer !important;
                        color: #666 !important;
                        background: none !important;
                        border: none !important;
                        font-size: 16px !important;
                        line-height: 1 !important;
                        border-radius: 4px !important;
                    }

                    .uslogger-button:hover {
                        background-color: rgba(0,0,0,0.1) !important;
                    }

                    @keyframes notification-fadein {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    .uslogger-notification {
                        animation: notification-fadein 0.3s ease-out;
                    }
                `;
                document.head.appendChild(style);
            }

            this.notificationContainer = document.createElement('div');
            this.notificationContainer.className = 'uslogger-container';
            this.notificationContainer.style.cssText = this._getPositionStyle();
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
                notification.remove();
                this.notifications.splice(index, 1);
            }
        },
    };

    // Expose the library
    context.USLogger = USLogger;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = USLogger;
    }
})(this);
