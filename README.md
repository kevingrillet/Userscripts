# Userscripts
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0?logo=gnu)
[![Tampermonkey, v4.11](https://img.shields.io/badge/Tampermonkey-v4.11-blue?logo=tampermonkey)](https://www.tampermonkey.net/)

 My homemade Tampermonkey userscripts

## Manganelo tweaks
Inspire by:
- [sm00nie](https://greasyfork.org/fr/users/165048-sm00nie)

It's create for Manganelo, but i think it can be used on other website like Mangakalot, need to update the env var...

### Bookmark
[![Manganelo tweaks (Bookmark)](https://img.shields.io/badge/Install.svg)](https://github.com/kevingrillet/Userscripts/raw/main/Manganelo%20Tweaks%20(Bookmark).user.js)

Add some functions:
- Export [*](https://greasyfork.org/fr/scripts/390432-mananelo-mangakakalot-bookmarks-export)
- Shortcut (Shift + E)

I use it to order my bookmarks by number to read...

### Chapter
[![Manganelo tweaks (Chapter)](https://img.shields.io/badge/Install.svg)](https://github.com/kevingrillet/Userscripts/raw/main/Manganelo%20Tweaks%20(Chapter).user.js)

Add many functions:
- Auto next (when scroll hit bottom)
- Load time (after JS is loaded, so it's mostly false, but indicate if images take .2s or 10s to load)
- Margin [*](https://greasyfork.org/fr/scripts/412938-manganelo-gap-remover)
- Max width [*](https://greasyfork.org/fr/scripts/408505-mangakakalot-image-max-width-height)
- Navigation: ←/A/Q (previous), →/D (previous),  B (bookmark page), H (home page) [*](https://greasyfork.org/fr/scripts/38268-left-right-arrow-key-navigation-for-manga-manhwa-manhua-sites)
- Prerender
- Reloading on error
- Removes Add div [*](https://greasyfork.org/fr/scripts/412938-manganelo-gap-remover)
- Scrolling: ↑/W/Z (scroll up), ↓/S (scroll down) [*](https://greasyfork.org/fr/scripts/418594-chapter-changer-smooth-scrolling)

## WIP
- Add other manga reader websites
- Configuration? [*](https://stackoverflow.com/questions/14594346/create-a-config-or-options-page-for-a-greasemonkey-script)
- Export chapter?

<details>
  <summary>FileSaver</summary>
  
  Open in popup :boom:

  ```Javascript
    // require https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.4/FileSaver.min.js
    var i = 0;
    setInterval(function(){
        if(images.length > i){
            saveAs(images[i].src, images[i].title);
            i++;
        }
    },1000);
  ```

</details>

<details>
  <summary>jsPDF</summary>

  [crossOrigin](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS) :sob:
  
  ```Javascript
    // require https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js
    // source https://github.com/MrRio/jsPDF/issues/317#issuecomment-604415689
    var doc = new window.jspdf.jsPDF();
    const imagesWidth = []
    const imgDataList = []
    const img = new Image();
    var ImageToLoad = new Image();

    for (let i of images) {
        getImageFromUrl(i.src, createPDF);
    }

    function getImageFromUrl(url, callback) {

        //ImageToLoad.crossOrigin = "Anonymous";

        ImageToLoad.onError = function () {
            console.log('Cannot load image: "' + url + '"');
        };

        ImageToLoad.onload = function () {
            alert("image is loaded");
        }

        ImageToLoad.onload = function () {
            imagesWidth.push({
                width: ImageToLoad.width,
                height: ImageToLoad.height
            })
            callback(ImageToLoad);
        };
        ImageToLoad.src = url;
        createPDF(ImageToLoad)
    }

    function createPDF(imgData) {
        imgDataList.push(imgData)
        // Rotate Image angle: -20,
        var pwidth = doc.internal.pageSize.getWidth();
        var pheight = doc.internal.pageSize.getHeight();
        var maxWidth = pwidth - 40; // Max width for the image
        var maxHeight = pheight - 40; // Max height for the image
        var ratio = 0; // Used for aspect ratio
        var width = imgData.width; // Current image width
        var height = imgData.height; // Current image height
        // Check if the current width is larger than the max
        if (width > maxWidth) {
            ratio = maxWidth / width; // get ratio for scaling image
            // $(this).css("width", maxWidth); // Set new width
            // $(this).css("height", height * ratio);  // Scale height based on ratio
            height = height * ratio; // Reset height to match scaled image
            width = width * ratio; // Reset width to match scaled image
        }
        // Check if current height is larger than max
        if (height > maxHeight) {
            ratio = maxHeight / height; // get ratio for scaling image
            // $(this).css("height", maxHeight);   // Set new height
            // $(this).css("width", width * ratio);    // Scale width based on ratio
            width = width * ratio; // Reset width to match scaled image
            height = height * ratio; // Reset height to match scaled image
        }
        doc.addImage({
            imageData: imgData,
            x: 20,
            y: 5,
            w: width,
            h: height,
            angle: -20
        });
        if (imgDataList.length !== images.length){
            doc.addPage();
        }
        if (imgDataList.length == images.length) {
            doc.save(document.getElementsByClassName('panel-chapter-info-top')[0].firstElementChild.textContent + '.pdf');
        }
    }
```

</details>
