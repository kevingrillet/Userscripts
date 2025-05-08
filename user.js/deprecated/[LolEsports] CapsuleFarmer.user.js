// ==UserScript==
// @name          [LoLEsports] CapsuleFarmer
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Auto loot capsules
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           lolesports.com
// @tag           deprecated
// @version       0.16

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/deprecated/[LoLEsports]%20CapsuleFarmer.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/deprecated/[LoLEsports]%20CapsuleFarmer.user.js

// @match         https://lolesports.com/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=lolesports.com
// @grant         GM_getValue
// @grant         GM_setValue
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';
    const loot_err = ['Les récompenses ont rencontré un problème.', 'Something went wrong with Rewards'];

    /****************************************************************************************************
     ******************************************** VARIABLES *********************************************
     ****************************************************************************************************/
    var waitLookForDrop = 10; // s
    var waitResetLookForDrop = 3600; // s => 1h

    var errLookForDrop = 0;
    var tryLookForDrop = 0;
    var nbLoot = 0;
    var arr = GM_getValue('arr', new Array());
    var map = new Map(arr.map((obj) => [obj.tournament, obj.drop]));
    var totalNbLoot = GM_getValue('totalNbLoot', 0);
    // var observer;
    // var elToObserve;

    // var filt = [];
    // document.querySelectorAll(':scope .button.league .label').forEach(e =>
    //     filt.push(`[${e.querySelector('.region').innerText}] ${e.querySelector('.name').innerText}`)
    // );
    // filt.sort();
    // console.debug(filt.join('\n'));
    // console.debug(filt.length);

    // [BRAZIL] CBLOL
    // [BRAZIL] CBLOL Academy
    // [CHINA] LPL
    // [COMMONWEALTH OF INDEPENDENT STATES] LCL
    // [EMEA] Arabian League
    // [EMEA] EMEA Masters
    // [EMEA] Elite Series
    // [EMEA] Esports Balkan League
    // [EMEA] Greek Legends League
    // [EMEA] Hitpoint Masters
    // [EMEA] LEC
    // [EMEA] La Ligue Française
    // [EMEA] Liga Portuguesa
    // [EMEA] NLC
    // [EMEA] PG Nationals
    // [EMEA] Prime League
    // [EMEA] SuperLiga
    // [EMEA] TCL
    // [EMEA] Ultraliga
    // [HONG KONG, MACAU, TAIWAN] PCS
    // [INTERNATIONAL] All-Star Event
    // [INTERNATIONAL] MSI
    // [INTERNATIONAL] TFT Monsters Attack!
    // [INTERNATIONAL] Worlds
    // [JAPAN] LJL
    // [JAPAN] LJL Academy
    // [KOREA] LCK
    // [KOREA] LCK Academy
    // [KOREA] LCK Challengers
    // [LATIN AMERICA NORTH] North Regional League
    // [LATIN AMERICA SOUTH] South Regional League
    // [LATIN AMERICA] LLA
    // [NORTH AMERICA] College Championship
    // [NORTH AMERICA] LCS
    // [NORTH AMERICA] LCS Challengers
    // [NORTH AMERICA] LCS Challengers Qualifiers
    // [OCEANIA] LCO
    // [VIETNAM] VCS
    // 38

    var aEvents = [
        /* LOL */
        // [INTERNATIONAL] All-Star Event
        'mondial', // [INTERNATIONAL] MSI
        'msi', // [INTERNATIONAL] Worlds

        'lck', // [KOREA] LCK
        'lpl', // [CHINA] LPL
        'emea', // [EMEA] EMEA Masters
        'lec', // [EMEA] LEC
        'lcs', // [NORTH AMERICA] LCS

        'cblol', // [BRAZIL] CBLOL
        // [BRAZIL] CBLOL Academy
        'lcl', // [COMMONWEALTH OF INDEPENDENT STATES] LCL
        // [EMEA] Arabian League
        'elite', // [EMEA] Elite Series
        // [EMEA] Esports Balkan League
        'greek', // [EMEA] Greek Legends League
        'hitpoint', // [EMEA] Hitpoint Masters
        // [EMEA] La Ligue Française
        'liga', // [EMEA] Liga Portuguesa
        'nlc', // [EMEA] NLC
        // [EMEA] PG Nationals
        'prime', // [EMEA] Prime League
        'superliga', // [EMEA] SuperLiga
        'tcl', // [EMEA] TCL
        'ultraliga', // [EMEA] Ultraliga
        'pcs', // [HONG KONG, MACAU, TAIWAN] PCS
        'ljl', // [JAPAN] LJL
        // [JAPAN] LJL Academy
        // [KOREA] LCK Academy
        // [KOREA] LCK Challengers
        'lla', // [LATIN AMERICA] LLA
        // [LATIN AMERICA NORTH] North Regional League
        // [LATIN AMERICA SOUTH] South Regional League
        // [NORTH AMERICA] College Championship
        // [NORTH AMERICA] LCS Challengers
        // [NORTH AMERICA] LCS Challengers Qualifiers
        'lco', // [OCEANIA] LCO
        'vcs', // [VIETNAM] VCS

        /* TFT */
        'tft-monsters-attack', // [INTERNATIONAL] TFT Monsters Attack!
    ];

    /****************************************************************************************************
     *************************** https://lolesports.com/live => CAPSULEFARMER ***************************
     ****************************************************************************************************/
    function closeRewardDrop() {
        setTimeout(function () {
            if (document.querySelector('.RewardsDropsOverlay .close')) {
                console.debug(`${formatConsoleDate(new Date())}- %c Drop overlay closed! `, 'background: GhostWhite; color: DarkRed');
                document.querySelector('.RewardsDropsOverlay .close').click();
                mapAdd();
                lookForDrop();
            } else {
                closeRewardDrop();
            }
        }, 0.5 * 1000);
    }

    function lookForDrop() {
        setTimeout(function () {
            if (document.querySelector('.message') && loot_err.includes(document.querySelector('.message').innerHTML)) {
                console.debug(`${formatConsoleDate(new Date())}- %c End?`, 'background: GhostWhite; color: DarkRed');
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
                    GM_setValue('totalNbLoot', totalNbLoot);
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
    }

    /****************************************************************************************************
     ************************** https://lolesports.com/schedule => WAITFORLIVE **************************
     ****************************************************************************************************/
    // Open Live
    var goLive = function () {
        if (document.querySelector('.text_live\\.primary')) {
            let allLives = Array.from(document.querySelectorAll('.text_live\\.primary')).map(e => e.closest('a').href);

            let firstMatch = allLives.filter((a) => aEvents.some((f) => a.includes(f)))[0] || '';
            if (firstMatch === '') firstMatch = allLives[0];

            // if (observer) {
            //     observer.disconnect();
            //     console.debug(`${formatConsoleDate(new Date())}- %c Observer removed!`, 'background: GhostWhite; color: DarkGreen');
            // }
            console.debug(`${formatConsoleDate(new Date())}- %c Go live! [${firstMatch}] `, 'background: GhostWhite; color: DarkGreen');
            window.location = firstMatch;
        }
    };

    // function onMutate() {
    //     goLive();
    // }

    // function findElement() {
    //     setTimeout(function () {
    //         if (document.querySelectorAll('.simplebar-mask')[1]) {
    //             elToObserve = document.querySelectorAll('.simplebar-mask')[1];
    //             observer = new MutationObserver(onMutate);
    //             observer.observe(elToObserve, { attributes: true, childList: true });
    //             console.debug(`${formatConsoleDate(new Date())}- %c Observer added!`, 'background: GhostWhite; color: DarkGreen');
    //             // console.log(observer);
    //             goLive();
    //         } else {
    //             findElement();
    //         }
    //     }, 0.5 * 1000);
    // }

    function findElement() {
        setTimeout(function () {
            goLive();
            findElement();
        }, 30 * 1000);
    }

    /****************************************************************************************************
     *********************************************** TOOLS **********************************************
     ****************************************************************************************************/
    function arrayUpdate() {
        arr = new Array();
        map.forEach((value, key) => arr.push({ tournament: key, drop: value }));
        arr.sort(function (a, b) {
            if (a.drop !== b.drop) return b.drop - a.drop;
            return a.tournament.localeCompare(b.tournament, 'en', { sensitivity: 'base' });
        });
    }

    function formatConsoleDate(date) {
        var hour = date.getHours();
        var minutes = date.getMinutes();
        // var seconds = date.getSeconds();
        // var milliseconds = date.getMilliseconds();

        return (
            '[' +
            (hour < 10 ? '0' + hour : hour) +
            ':' +
            (minutes < 10 ? '0' + minutes : minutes) +
            // ':' +
            // ((seconds < 10) ? '0' + seconds: seconds) +
            // '.' +
            // ('00' + milliseconds).slice(-3) +
            '] '
        );
    }

    function mapAdd(value = 1) {
        // let uuid = document.querySelector('#video-player-placeholder')?.getAttribute('uuid');
        let uuid = document.location.href;
        if (uuid) {
            map.set(uuid, (map.get(uuid) ?? 0) + value);
            console.debug(`${formatConsoleDate(new Date())}- %c Set value: ${uuid} ${map.get(uuid)}`, 'background: GhostWhite; color: DarkBlue');
            mapSave();
        }
    }

    function mapClean(full = false) {
        if (full === true) {
            map = new Map();
        } else {
            map = new Map(
                [...map].filter(([_, value]) => value > 0)
            );
        }
        mapSave();
    }

    function mapPrint() {
        arrayUpdate();
        console.debug(map);
        console.table(arr);
    }

    function mapSave() {
        arrayUpdate();
        GM_setValue('arr', arr);
    }

    function whereAmI() {
        if (window.location.href.includes('/schedule')) {
            console.debug(`${formatConsoleDate(new Date())}- %c WhereAmI? => Schedule `, 'background: GhostWhite; color: DarkGreen');
            findElement();
        } else if (window.location.href.includes('/live')) {
            console.debug(`${formatConsoleDate(new Date())}- %c WhereAmI? => Live `, 'background: GhostWhite; color: DarkGreen');
            setTimeout(function () {
                mapAdd(0);
                lookForDrop();
            }, 5 * 1000);
            } else if(window.location.href.includes('/vods')) {
                window.location = 'https://lolesports.com/schedule';
        } else {
            console.error(`${formatConsoleDate(new Date())}- Unknown location: ${window.location}`);
        }
    }

    window.addEventListener('load', function () {
        whereAmI();
    });

    document.addEventListener('keydown', (event) => {
        if (event.code === 'KeyM') {
            mapPrint();
        } else if (event.code === 'KeyI') {
            mapClean(event.ctrlKey);
        }
    });
})();
