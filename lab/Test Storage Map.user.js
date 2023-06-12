// ==UserScript==
// @name          /!\ Test Storage Map
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Experiment about Storage & JS Map
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.01

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/lab/Test%20Storage%20Map.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/lab/Test%20Storage%20Map.user.js

// @match         *://*/*
// @grant         GM_getValue
// @grant         GM_setValue
// @run-at        document-end
// ==/UserScript==

(function () {
    let uuid = Date.now().toString(36) + Math.random().toString(36).substring(2);
    let arr;
    let map;

    function add_values() {
        console.log(`Set ${(map.get(uuid) ?? 0) + 1} to ${uuid}` );
        map.set(uuid, (map.get(uuid) ?? 0) + 1);
    }

    function load_values() {
        arr = GM_getValue("arr", new Array())
        // map = GM_getValue("map", new Map())
        map = new Map();
        arr.forEach((obj) => {
            map.set(obj.key, obj.value);
        });
    }

    function print_values() {
        console.log("arr")
        console.log(arr)
        console.table(arr)
        console.log("map")
        console.log(map)
        console.table(map)
    }

    function reset_values() {
        console.log("reset")
        arr = new Array();
        map = new Map();
    }

    function save_values() {
        console.log(`Save` );
        arr = new Array();
        map.forEach((value, key) => arr.push({ key : key, value: value }));
        GM_setValue("map", map);
        GM_setValue("arr", arr);
    }


    document.addEventListener('keydown', event => {
        if (event.code === 'KeyA') {
            add_values();
        }else if (event.code === 'KeyL') {
            load_values();
        }else if (event.code === 'KeyP') {
            print_values();
        }else if (event.code === 'KeyR') {
            reset_values();
        }else if (event.code === 'KeyS') {
            save_values();
        }
    });
})();
