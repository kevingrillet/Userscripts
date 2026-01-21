// ==UserScript==
// @name          [TEST] StorageMap
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Experiment about GM Storage & JS Map
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           test
// @version       0.0.1

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/tests/[TEST]StorageMap.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/tests/[TEST]StorageMap.user.js

// @match         https://www.example.com/*
// @icon          https://www.google.com/s2/favicons?domain=example.com
// @grant         GM_getValue
// @grant         GM_setValue
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    let uuid = Date.now().toString(36) + Math.random().toString(36).substring(2);
    let arr;
    let map;
    load_values();
    add_values(0);

    function add_values(value = 1) {
        console.log(`Set ${(map.get(uuid) ?? 0) + value} to ${uuid}`);
        map.set(uuid, (map.get(uuid) ?? 0) + value);
        update_array();
    }

    function clean_values() {
        console.log('Clean');
        map = new Map([...map].filter(([_, value]) => value > 0));
        update_array();
    }

    function load_values() {
        console.log('Load');
        arr = GM_getValue('arr', new Array());
        // map = GM_getValue("map", new Map())
        map = new Map();
        arr.forEach((obj) => {
            map.set(obj.key, obj.value);
        });
    }

    function print_values() {
        console.log('Print');
        console.log('arr');
        console.log(arr);
        console.table(arr);
        console.log('map');
        console.log(map);
        console.table(map);
    }

    function reset_values() {
        console.log('Reset');
        arr = new Array();
        map = new Map();
    }

    function save_values() {
        console.log(`Save`);
        GM_setValue('map', map);
        GM_setValue('arr', arr);
    }

    function update_array() {
        arr = new Array();
        map.forEach((value, key) => arr.push({ key: key, value: value }));
        arr.sort(function (a, b) {
            return b.value - a.value;
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.code === 'KeyA') {
            add_values();
        } else if (event.code === 'KeyC') {
            clean_values();
        } else if (event.code === 'KeyL') {
            load_values();
        } else if (event.code === 'KeyP') {
            print_values();
        } else if (event.code === 'KeyR') {
            reset_values();
        } else if (event.code === 'KeyS') {
            save_values();
        }
    });
})();
