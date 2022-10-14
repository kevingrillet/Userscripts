// ==UserScript==
// @name          [LolEsports] GoToLiveWorld
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Et on se sort les doigts du C.
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.2

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[LolEsports]%20GoToLiveWorld.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[LolEsports]%20GoToLiveWorld.user.js

// @match         https://lolesports.com/schedule*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=lolesports.com/
// @grant         none
// @run-at        document-end
// ==/UserScript==

(function() {
    'use strict';

    var observer;
    var elToObserve;

    var goLive = function() {
        if (document.querySelector('.EventShow .mondial')) {
            document.querySelector('.EventShow .mondial').click();
            if (observer) {
                observer.disconnect();
            }
        }
    };

    var onMutate = function() {
        goLive();
    };

    var findElement = function() {
        setTimeout(function () {
            if (document.querySelector('.Event')){
                goLive();
                elToObserve = document.querySelector('.Event');
                observer = new MutationObserver(onMutate);
                observer.observe(elToObserve, {attributes: true, childList: true});
                console.log('%c Observer added! ', 'background: GhostWhite; color: DarkGreen');
                console.log(observer);
            }else{
                findElement();
            }
        }, .5 * 1000);
    };
    findElement();
})();
