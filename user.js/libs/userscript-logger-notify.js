// ==UserScript==
// @name          [Library] Userscript Logger
// @namespace     https://github.com/kevingrillet
// @version       1.0
// @description   Bibliothèque de gestion de logs et notifications pour userscripts Tampermonkey
// @author        Kevin GRILLET
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/libs/userscript-logger-notify.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/libs/userscript-logger-notify.js
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
        error(...args) {
            this._log('error', ...args);
        },

        _log(level, ...args) {
            if (this.levels[level] < this.levels[this.logLevel]) return;

            const prefix = `%c${this.config.scriptName}%c ${level.toUpperCase()}`;
            const styles = ['background: #4285F4; color: white; padding: 2px 4px; border-radius: 2px;', 'background: none; color: inherit;'];

            let logArgs = [...args];
            let timestamp = '';

            if (this.config.showTimestamp) {
                timestamp = new Date().toLocaleTimeString('fr-FR', { hour12: false });
                logArgs.unshift(`[${timestamp}]`);
            }

            // Console log
            console[level](prefix, ...styles, ...logArgs);

            // Notification si niveau suffisant
            if (this.levels[level] >= this.levels[this.config.notifyLevel]) {
                const message = this._formatLogToString(timestamp, level, args);
                this.notify(message, level, { copyable: level === 'error' });
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
            notification.className = `userscript-notification userscript-notification-${type}`;
            notification.style.cssText = `
                background-color: white;
                color: #333;
                border-radius: 4px;
                padding: 12px 16px;
                margin: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                pointer-events: auto;
                position: relative;
                max-width: 400px;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-left: 4px solid ${this._getTypeColor(type)};
            `;

            const messageDiv = document.createElement('div');
            messageDiv.style.flex = '1';
            messageDiv.textContent = message;

            const buttonsDiv = document.createElement('div');
            buttonsDiv.style.cssText = 'display: flex; gap: 5px; margin-left: 10px;';

            // Bouton copier si option activée
            if (options.copyable) {
                const copyButton = this._createButton('📋');
                copyButton.title = 'Copier';
                copyButton.onclick = () => {
                    navigator.clipboard.writeText(message).then(() => {
                        copyButton.textContent = '✓';
                        setTimeout(() => (copyButton.textContent = '📋'), 1000);
                    });
                };
                buttonsDiv.appendChild(copyButton);
            }

            // Bouton fermer
            const closeButton = this._createButton('×');
            closeButton.onclick = () => this.close(notification);
            buttonsDiv.appendChild(closeButton);

            notification.appendChild(messageDiv);
            notification.appendChild(buttonsDiv);

            this.notificationContainer.appendChild(notification);
            this.notifications.push(notification);

            if (this.config.notifyDuration > 0) {
                setTimeout(() => this.close(notification), this.config.notifyDuration);
            }

            return notification;
        },

        _createButton(text) {
            const button = document.createElement('button');
            button.style.cssText = `
                background: none;
                border: none;
                color: #666;
                font-size: 16px;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
            `;
            button.textContent = text;
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
            this.notificationContainer = document.createElement('div');
            this.notificationContainer.style.cssText = `
                position: fixed;
                z-index: 9999;
                ${this._getPositionStyle()}
                display: flex;
                flex-direction: column;
                pointer-events: none;
            `;
            document.body.appendChild(this.notificationContainer);

            if (this.config.animate) {
                const style = document.createElement('style');
                style.textContent = this._getAnimationStyles();
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
