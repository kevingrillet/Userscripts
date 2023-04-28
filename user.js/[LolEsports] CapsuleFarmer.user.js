// ==UserScript==
// @name          [LolEsports] CapsuleFarmer
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Auto loot capsules
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.2

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[LolEsports]%20CapsuleFarmer.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[LolEsports]%20CapsuleFarmer.user.js

// @match         https://lolesports.com/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=lolesports.com
// @grant         none
// @run-at        document-end
// ==/UserScript==

(function() {
    'use strict';

    // CapsuleFarmer part
    var closeRewardDrop = function (){
        setTimeout(function () {
            if (document.querySelector('.RewardsDropsOverlay .close')){
                console.debug('%c Drop overlay closed! ', 'background: GhostWhite; color: DarkRed');
                document.querySelector('.RewardsDropsOverlay .close').click();
                lookForDrop();
            }else{
                closeRewardDrop();
            }
        }, .5 * 1000);
    };

    var lookForDrop = function() {
        setTimeout(function () {
            if (document.querySelector('.InformNotifications .drops-fulfilled')){
                console.debug('%c Drop collected! ', 'background: GhostWhite; color: DarkGreen');
                document.querySelector('.InformNotifications .drops-fulfilled .text').click();
                closeRewardDrop();
            } else if(window.location.href.includes('https://lolesports.com/vods')) {
                // if live did end, get back to schedule
                console.debug('%c Live ended! ', 'background: GhostWhite; color: DarkBlue');
                window.location = 'https://lolesports.com/schedule';
            } else{
                // console.debug('%c No drop! ', 'background: GhostWhite; color: DarkBlue');
                lookForDrop();
            }
        }, 10 * 1000);
    };

    // Open Live
    var observer;
    var elToObserve;

    var goLive = function() {
        if (document.querySelector('.EventShow a')) {
            // mondial
            // tft-rising-legends
            if (observer) {
                observer.disconnect();
            }
            window.location = document.querySelector('.EventShow a').href;
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
                console.debug('%c Observer added! ', 'background: GhostWhite; color: DarkGreen');
                // console.log(observer);
            } else{
                findElement();
            }
        }, .5 * 1000);
    };

    var whereAmI = function() {
        console.debug(`%c WhereAmI? => ${window.location.href}`, 'background: DarkBlue; color: GhostWhite');
        if(window.location.href.includes('https://lolesports.com/schedule')) {
            console.debug(`%c WhereAmI? => Observe For Live`, 'background: DarkBlue; color: GhostWhite');
            findElement();
        } else if(window.location.href.includes('https://lolesports.com/live')) {
            console.debug(`%c WhereAmI? => Wait for Capsule`, 'background: DarkBlue; color: GhostWhite');
            lookForDrop();
        } else if(window.location.href.includes('https://lolesports.com/vods')) {
            window.location = 'https://lolesports.com/schedule';
        } else {
            console.error('Unknown location:', window.location)
        }
    }

    window.addEventListener('load', function () {
        whereAmI();
    });
})();