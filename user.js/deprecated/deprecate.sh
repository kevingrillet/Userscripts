#!/bin/bash

# https://sed.js.org/
# -E 's/https:\/\/raw\.githubusercontent\.com\/kevingrillet\/Userscripts\/main\/user\.js\/(.*\/)?(.+\.user\.js)/https:\/\/raw\.githubusercontent\.com\/kevingrillet\/Userscripts\/main\/user\.js\/\1deprecated\/\2/'

# Example
# // @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/XXXXX.user.js
# // @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/lab/XXXXX.user.js
# [![XXXXX](https://img.shields.io/badge/Install-0.0-red.svg?logo=XXXXX)](https://github.com/kevingrillet/Userscripts/raw/main/user.js/XXXXX.user.js)
# [![XXXXX](https://img.shields.io/badge/Install-0.0-red.svg?logo=XXXXX)](https://github.com/kevingrillet/Userscripts/raw/main/user.js/lab/XXXXX.user.js)

BASE_URL="https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/"
DEPRECATED_FOLDER="deprecated/"
FILE_EXTENSION=".user.js"

if [ -n "${1}" ]; then
    sed -Eir "s|${BASE_URL}(.*\/)?(.+${FILE_EXTENSION})|${BASE_URL}\1${DEPRECATED_FOLDER}\2|" "${1}"
    rm "${1}r"
else
    find . -type f \( -iname \*.js -o -iname \*.md \) -exec \
        sed -Eir "s|${BASE_URL}(.*\/)?(.+${FILE_EXTENSION})|${BASE_URL}\1${DEPRECATED_FOLDER}\2|" \
        {} +
    rm ./*.jsr ./*.mdr
fi
