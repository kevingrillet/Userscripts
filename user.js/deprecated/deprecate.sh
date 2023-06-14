#!/bin/bash

BASE_URL="https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/"
DEPRECATED_FOLDER="deprecated/"
FILE_EXTENSION=".user.js"

if [ -n "$1" ]
then
    sed -Eir "s|${BASE_URL}(.*\/)?(.+${FILE_EXTENSION})|${BASE_URL}\1${DEPRECATED_FOLDER}\2|" "$1"
else
    find . -type f -name '*.js' -exec \
        sed -Eir "s|${BASE_URL}(.*\/)?(.+${FILE_EXTENSION})|${BASE_URL}\1${DEPRECATED_FOLDER}\2|" \
        {} +
fi
rm ./*.jsr ./*.mdr
