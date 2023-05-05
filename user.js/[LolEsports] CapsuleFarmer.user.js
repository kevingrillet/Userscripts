// ==UserScript==
// @name          [LolEsports] CapsuleFarmer
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Auto loot capsules
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.3

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
    let tryLookForDrop = 0;

    function formatConsoleDate (date) {
        var hour = date.getHours();
        var minutes = date.getMinutes();
        // var seconds = date.getSeconds();
        // var milliseconds = date.getMilliseconds();

        return '[' +
               ((hour < 10) ? '0' + hour: hour) +
               ':' +
               ((minutes < 10) ? '0' + minutes: minutes) +
               // ':' +
               // ((seconds < 10) ? '0' + seconds: seconds) +
               // '.' +
               // ('00' + milliseconds).slice(-3) +
               '] ';
    }

    // CapsuleFarmer part
    var closeRewardDrop = function (){
        setTimeout(function () {
            if (document.querySelector('.RewardsDropsOverlay .close')){
                console.debug(`${formatConsoleDate(new Date())}- %c Drop overlay closed! `, 'background: GhostWhite; color: DarkRed');
                document.querySelector('.RewardsDropsOverlay .close').click();
                lookForDrop();
            }else{
                closeRewardDrop();
            }
        }, .5 * 1000);
    };

    var lookForDrop = function() {
        setTimeout(function () {
            if (document.querySelector('.message') && document.querySelector('.message').innerHTML === 'Les récompenses ont rencontré un problème.') {
                console.debug(`${formatConsoleDate(new Date())}- %c Bug? - Les récompenses ont rencontré un problème. `, 'background: GhostWhite; color: DarkRed');
                tryLookForDrop += 1;
                if (tryLookForDrop > 3){
                    tryLookForDrop = 0;
                    window.location = 'https://lolesports.com/schedule';
                }
            } else {
                tryLookForDrop = 0;
            }

            if (document.querySelector('.InformNotifications .drops-fulfilled')){
                console.debug(`${formatConsoleDate(new Date())}- %c Drop collected! `, 'background: GhostWhite; color: DarkGreen');
                document.querySelector('.InformNotifications .drops-fulfilled .text').click();
                closeRewardDrop();
            } else if(window.location.href.includes('https://lolesports.com/vods') || document.querySelector('.html5-endscreen')) {
                // if live did end, get back to schedule
                console.debug(`${formatConsoleDate(new Date())}- %c Live ended! `, 'background: GhostWhite; color: DarkBlue');
                window.location = 'https://lolesports.com/schedule';
            } else{
                console.debug(`%c No drop! `, 'background: GhostWhite; color: DarkBlue');
                lookForDrop();
            }
        }, 10 * 1000);
    };

    // Open Live
    var observer;
    var elToObserve;
    var classEvents = [
        'mondial',
        'msi',
        'emea-masters',
        'tft-rising-legends',
        'lco'
    ];

    var goLive = function() {
        if (document.querySelector('a.live')) {
            let allLives = Array.from(document.querySelectorAll('a.live'));
            let firstMatch = classEvents.filter(cls => allLives.some(lv => lv.classList.contains(cls)))[0] || '';
            if (firstMatch !== '') firstMatch = '.' + firstMatch;

            if (observer) {
                observer.disconnect();
                console.debug(`${formatConsoleDate(new Date())}- %c Observer removed!`, 'background: GhostWhite; color: DarkGreen');
            }
            console.debug(`${formatConsoleDate(new Date())}- %c Go live! [${firstMatch !== '' ? firstMatch.slice(1) : document.querySelector('a.live').classList.value}] `, 'background: GhostWhite; color: DarkGreen');
            window.location = document.querySelector(`a.live${firstMatch}`).href;
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
                console.debug(`${formatConsoleDate(new Date())}- %c Observer added!`, 'background: GhostWhite; color: DarkGreen');
                // console.log(observer);
            } else{
                findElement();
            }
        }, .5 * 1000);
    };

    var whereAmI = function() {
        if(window.location.href.includes('https://lolesports.com/schedule')) {
            console.debug(`${formatConsoleDate(new Date())}- %c WhereAmI? => Schedule `, 'background: GhostWhite; color: DarkGreen');
            findElement();
        } else if(window.location.href.includes('https://lolesports.com/live')) {
            console.debug(`${formatConsoleDate(new Date())}- %c WhereAmI? => Live `, 'background: GhostWhite; color: DarkGreen');
            lookForDrop();
        // } else if(window.location.href.includes('https://lolesports.com/vods')) {
        //     window.location = 'https://lolesports.com/schedule';
        } else {
            console.error(`${formatConsoleDate(new Date())}- Unknown location: ${window.location}`)
        }
    }

    window.addEventListener('load', function () {
        whereAmI();
    });
})();