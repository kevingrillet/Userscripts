// ==UserScript==
// @name          [LolEsports] CapsuleFarmer
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Auto loot capsules
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.6

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[LolEsports]%20CapsuleFarmer.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[LolEsports]%20CapsuleFarmer.user.js

// @match         https://lolesports.com/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=lolesports.com
// @grant         GM_getValue
// @grant         GM_setValue
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    /****************************************************************************************************
     ******************************************** VARIABLES *********************************************
     ****************************************************************************************************/
    var errLookForDrop = 0;
    var tryLookForDrop = 0;
    var nbLoot = 0;
    var totalNbLoot = GM_getValue("totalNbLoot", 0);
    var waitLookForDrop = 10; // s
    var waitResetLookForDrop = 3600; // s => 1h

    var observer;
    var elToObserve;
    var classEvents = [
        // Worlds
        'mondial',
        'msi',

        // League 1
        // lcs, lec, pcs

        // League 2
        'emea-masters', // EU Masters (uniting EU, TR, CIS, and MENA)
        'lco', // League of Legends Circuit Oceania

        // TFT
        'tft-monsters-attack', // World top 32
        'tft-rising-legends', // EMEA
        'tft-western-lcq', // LATAM, Brazil, NA, and EMEA
    ];

    /****************************************************************************************************
     *************************** https://lolesports.com/live => CAPSULEFARMER ***************************
     ****************************************************************************************************/
    var closeRewardDrop = function () {
        setTimeout(function () {
            if (document.querySelector('.RewardsDropsOverlay .close')) {
                console.debug(`${formatConsoleDate(new Date())}- %c Drop overlay closed! `, 'background: GhostWhite; color: DarkRed');
                document.querySelector('.RewardsDropsOverlay .close').click();
                lookForDrop();
            } else {
                closeRewardDrop();
            }
        }, .5 * 1000);
    };

    var lookForDrop = function () {
        setTimeout(function () {
            if (document.querySelector('.message') && document.querySelector('.message').innerHTML === 'Les récompenses ont rencontré un problème.') {
                console.debug(`${formatConsoleDate(new Date())}- %c Fin? - Les récompenses ont rencontré un problème. `, 'background: GhostWhite; color: DarkRed');
                errLookForDrop += 1;
                if (errLookForDrop > 3) {
                    errLookForDrop = 0;
                    window.location = 'https://lolesports.com/schedule';
                }
                lookForDrop();
            } else {
                errLookForDrop = 0;

                if (document.querySelector('.InformNotifications .drops-fulfilled')) {
                    console.debug(`${formatConsoleDate(new Date())}- %c Drop collected! `, 'background: GhostWhite; color: DarkGreen');
                    document.querySelector('.InformNotifications .drops-fulfilled .text').click();
                    tryLookForDrop = 0;
                    nbLoot += 1;
                    totalNbLoot += 1;
                    GM_setValue("totalNbLoot", totalNbLoot);
                    closeRewardDrop();
                } else if (window.location.href.includes('https://lolesports.com/vods')) {
                    // if live did end, get back to schedule
                    console.debug(`${formatConsoleDate(new Date())}- %c Live ended! `, 'background: GhostWhite; color: DarkBlue');
                    window.location = 'https://lolesports.com/schedule';
                } else if (tryLookForDrop > waitResetLookForDrop / waitLookForDrop) {
                    console.debug(`${formatConsoleDate(new Date())}- %c Long time without drops ! [1h] `, 'background: GhostWhite; color: DarkBlue');
                    // window.location = 'https://lolesports.com/schedule';
                    location.reload();
                } else {
                    console.debug(`%c [${nbLoot} / ${totalNbLoot}] No drop! `, 'background: GhostWhite; color: DarkBlue');
                    tryLookForDrop += 1;
                    lookForDrop();
                }
            }
        }, waitLookForDrop * 1000);
    };

    /****************************************************************************************************
     ************************** https://lolesports.com/schedule => WAITFORLIVE **************************
     ****************************************************************************************************/
    // Open Live
    var goLive = function () {
        if (document.querySelector('a.live')) {
            let allLives = Array.from(document.querySelectorAll('a.live'));
            let firstMatch = classEvents.filter(cls => allLives.some(lv => lv.classList.contains(cls)))[0] || '';
            if (firstMatch !== '') firstMatch = '.' + firstMatch;

            if (observer) {
                observer.disconnect();
                console.debug(`${formatConsoleDate(new Date())}- %c Observer removed!`, 'background: GhostWhite; color: DarkGreen');
            }
            console.debug(`${formatConsoleDate(new Date())}- %c Go live! [${firstMatch !== '' ? firstMatch.slice(1) : Array.from(document.querySelector('a.live').classList).filter(cls => !['single', 'live', 'event'].includes(cls)).toString()}] `, 'background: GhostWhite; color: DarkGreen');
            window.location = document.querySelector(`a.live${firstMatch}`).href;
        }
    };

    var onMutate = function () {
        goLive();
    };

    var findElement = function () {
        setTimeout(function () {
            if (document.querySelector('.Event')) {
                elToObserve = document.querySelector('.Event');
                observer = new MutationObserver(onMutate);
                observer.observe(elToObserve, { attributes: true, childList: true });
                console.debug(`${formatConsoleDate(new Date())}- %c Observer added!`, 'background: GhostWhite; color: DarkGreen');
                // console.log(observer);
                goLive();
            } else {
                findElement();
            }
        }, .5 * 1000);
    };

    /****************************************************************************************************
     *********************************************** TOOLS **********************************************
     ****************************************************************************************************/
    function formatConsoleDate(date) {
        var hour = date.getHours();
        var minutes = date.getMinutes();
        // var seconds = date.getSeconds();
        // var milliseconds = date.getMilliseconds();

        return '[' +
            ((hour < 10) ? '0' + hour : hour) +
            ':' +
            ((minutes < 10) ? '0' + minutes : minutes) +
            // ':' +
            // ((seconds < 10) ? '0' + seconds: seconds) +
            // '.' +
            // ('00' + milliseconds).slice(-3) +
            '] ';
    }

    var whereAmI = function () {
        if (window.location.href.includes('https://lolesports.com/schedule')) {
            console.debug(`${formatConsoleDate(new Date())}- %c WhereAmI? => Schedule `, 'background: GhostWhite; color: DarkGreen');
            findElement();
        } else if (window.location.href.includes('https://lolesports.com/live')) {
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
