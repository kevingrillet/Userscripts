# Userscripts
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?logo=gnu)](https://www.gnu.org/licenses/gpl-3.0)
[![Tampermonkey, v4.11](https://img.shields.io/badge/Tampermonkey-v4.11-blue?logo=tampermonkey)](https://www.tampermonkey.net/)
[![Google Chrome, v88 min](https://img.shields.io/badge/Chrome->v88-blue?logo=tampermonkey)](https://www.google.com/intl/fr_fr/chrome/)

 My homemade Tampermonkey userscripts.

 ## Summary
 - [Amazon](#Amazon-tweaks)
 - [Bing](#Bing)
 - [Github](#Github)
 - [Google](#Google)
 - [League of Legends](#League-of-Legends)
 - [Manganelo](#Manganelo)
 - [Youtube](#Youtube)

## Amazon tweaks
### ToDo - UI [![Amazon tweaks - UI](https://img.shields.io/badge/Install-0.0-red.svg?logo=tampermonkey)](https://github.com/kevingrillet/Userscripts/raw/main/Amazon%20Tweaks%20(UI).user.js)
### WIP - Wishlist [![Amazon tweaks - Wishlist](https://img.shields.io/badge/Install-0.1-orange.svg?logo=tampermonkey)](https://github.com/kevingrillet/Userscripts/raw/main/Amazon%20Tweaks%20(Wishlist).user.js)

## Bing
### To Google [![Bing - To Google](https://img.shields.io/badge/Install-1.0-green.svg?logo=tampermonkey)](https://github.com/kevingrillet/Userscripts/raw/main/Bing%20To%20Google.user.js)

## Github
### Inactive [![Github - Inactive](https://img.shields.io/badge/Install-1.2-green.svg?logo=tampermonkey)](https://github.com/kevingrillet/Userscripts/raw/main/Github%20Inactive.user.js)

Add warning to to repos without updates for more than 1/2 year.

## Google
### ~~Incognito~~ [![Google - Incognito](https://img.shields.io/badge/Install-0.1-black.svg?logo=tampermonkey)](https://github.com/kevingrillet/Userscripts/raw/main/Google%20Incognito.user.js)

~~Open every docs.google.com link in incognito.~~

:warning: [Can't be done](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/create)

### Search Ad Remover [![Google - Search Ad Remover](https://img.shields.io/badge/Install-1.1-green.svg?logo=tampermonkey)](https://github.com/kevingrillet/Userscripts/raw/main/Google%20Search%20Ad%20Remover.user.js)

Remove the add at the beginig of some searches.

## League Of Legends
### League Of Fitness [![League Of Fitness](https://img.shields.io/badge/Install-1.1-green.svg?logo=tampermonkey)](https://github.com/kevingrillet/Userscripts/raw/main/League%20Of%20Fitness.user.js)

[Original concept.](https://www.reddit.com/r/leagueoflegends/comments/1li068/league_of_fitness/)

## Manganelo tweaks
Inspire by:
- [fuzetsu](https://github.com/fuzetsu/manga-loader)
- [sm00nie](https://greasyfork.org/fr/users/165048-sm00nie)

It's create for Manganelo, but i think it can be used on other website like Mangakalot, need to update the env var...

### Bookmark [![Manganelo tweaks - Bookmark](https://img.shields.io/badge/Install-1.6-green.svg?logo=tampermonkey)](https://github.com/kevingrillet/Userscripts/raw/main/Manganelo%20Tweaks%20(Bookmark).user.js)

Add some functions:
- Export [*](https://greasyfork.org/fr/scripts/390432-mananelo-mangakakalot-bookmarks-export)
- Repair user-notification
- Shortcut (Shift + E)

I use it to order my bookmarks by number to read...

### Chapter [![Manganelo tweaks - Chapter](https://img.shields.io/badge/Install-1.6-green.svg?logo=tampermonkey)](https://github.com/kevingrillet/Userscripts/raw/main/Manganelo%20Tweaks%20(Chapter).user.js)

Add many functions:
- Auto next (when scroll hit bottom)
- Duplicate chapter
- Load time (after JS is loaded, so it's mostly false, but indicate if images take .2s or 10s to load)
- Margin [*](https://greasyfork.org/fr/scripts/412938-manganelo-gap-remover)
- Max width [*](https://greasyfork.org/fr/scripts/408505-mangakakalot-image-max-width-height)
- Navigation: ←/A/Q (previous), →/D (previous),  B (bookmark page), H (home page) [*](https://greasyfork.org/fr/scripts/38268-left-right-arrow-key-navigation-for-manga-manhwa-manhua-sites)
- Prerender
- Reloading on error
- Removes Add div [*](https://greasyfork.org/fr/scripts/412938-manganelo-gap-remover)
- Scrolling: ↑/W/Z (scroll up), ↓/S (scroll down) [*](https://greasyfork.org/fr/scripts/418594-chapter-changer-smooth-scrolling)

### ToDo
- Add other manga reader websites (atm i only read here...)
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

- Loading bar (for % of images loaded?)

<details>
  <summary>State of the Art</summary>

  Not working atm :sob:
  
  ```Javascript
    var elDivLoading = document.createElement('div');
    elDivLoading.id = 'my_loading';
    elDivLoading.innerHTML = `
    <div id="success"></div>
    <div id="error"></div>
    `;
    document.body.append(elDivLoading);

    function imageIsLoad(){
        imgSuccess++;
        document.getElementById('my_loading').getElementById('success').style.width = images.length / imgSuccess + "%";
        if ((imgSuccess + imgError) >= images.length) {
            document.getElementById('my_loading').style.opacity = 0;
        }
    }

    // Reloading on errors
    function reloadImage(pThis){
        if ( pThis && pThis.src) {
            pThis.setAttribute('try', pThis.hasAttribute('try') ? Number(pThis.getAttribute('try')) + 1 : 1);
            if (Number(pThis.getAttribute('try')) == 1) {
                imgError++;
                document.getElementById('my_loading').getElementById('error').style.width = images.length / imgError + "%";
                if ((imgSuccess + imgError) >= images.length) {
                    document.getElementById('my_loading').style.opacity = 0;
                }
            }
            if (Number(pThis.getAttribute('try')) > 5) {
                console.error('Failed to load: ' + pThis.src);
                pThis.removeAttribute('onerror');
            } else {
                console.warn('Failed to load (' + pThis.getAttribute('try') + '): ' + pThis.src);
                pThis.src = pThis.src;
            }
        }
    };

    var script = document.createElement('script');
    script.appendChild(document.createTextNode(`
    var imgSuccess = 0, imgError = 0, images = document.getElementsByClassName('${CST_CLASS_IMG}')[0].getElementsByTagName('img'),images
    ${imageIsLoad}
    ${reloadImage}
    `));
    head.appendChild(script);

    function setSuccess() {
        for (let i of images) {
            if ( i && i.src) {
                i.setAttribute('load','imageIsLoad();');
            }
        };
    }
    setSuccess();

    function setReload() {
        for (let i of images) {
            if ( i && i.src) {
                i.setAttribute('onerror','reloadImage(this);');
            }
        };
    }
    setReload();
```

</details>

## YouTube
### Auto Confirmer [![YouTube - Auto Confirmer](https://img.shields.io/badge/Install-1.1-green.svg?logo=tampermonkey)](https://github.com/kevingrillet/Userscripts/raw/main/Youtube%20Auto%20Confirmer.user.js)

Automatically clicks 'Ok' when the 'Video paused. Continue watching?' dialog pops up and pauses your videos.
**Need to be the active tab.**

### Downloader (Yout.com) [![YouTube - Downloader](https://img.shields.io/badge/Install-1.2-green.svg?logo=tampermonkey)](https://github.com/kevingrillet/Userscripts/raw/main/Youtube%20Downloader.user.js)

Add button near subscribe to go to Yout.com to download the video/mp3.
