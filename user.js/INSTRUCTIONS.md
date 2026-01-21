# Instructions for Tampermonkey Scripts

## ⚠️ Synchronization with README

**IMPORTANT**: Every script modification or addition must be synchronized with the `README.md` file at the project root.

For each script, make sure to:

1. Add an entry in the summary
2. Create a dedicated section with:
    - The script title
    - An installation badge pointing to the raw file on GitHub
    - A description of the features

## Mandatory Header Structure

All Tampermonkey scripts must follow this header structure:

```javascript
// ==UserScript==
// @name          [Service name] Short description
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Detailed description of script features
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           service-name
// @version       X.Y.Z

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Service]%20Description.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Service]%20Description.user.js

// @match         https://www.example.com/*
// @icon          https://www.google.com/s2/favicons?domain=example.com
// @grant         none
// @run-at        document-end
// ==/UserScript==
```

### Mandatory Fields

#### Base Metadata

- **@name**: Format `[Service] Short description`
    - Example: `[Amazon] Tweaks`, `[GitHub] Inactive`
- **@namespace**: Always `https://github.com/kevingrillet`
- **@author**: Always `Kevin GRILLET`
- **@description**: Clear and concise description of features
- **@copyright**: Always `https://github.com/kevingrillet`
- **@license**: Always `GPL-3.0 License`

#### Tags

- **@tag**: At least two tags
    1. `kevingrillet` (mandatory)
    2. The service/domain name (e.g.: `amazon`, `github.com`, `instagram.com`)

#### Version

- **@version**: Semantic format `MAJOR.MINOR.PATCH`
    - MAJOR: Breaking changes
    - MINOR: Backward-compatible feature additions
    - PATCH: Bug fixes

#### URLs

- **@homepageURL**: `https://github.com/kevingrillet/Userscripts/`
- **@supportURL**: `https://github.com/kevingrillet/Userscripts/issues`
- **@downloadURL**: GitHub raw URL to the file
    - Format: `https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/[Service]%20Description.user.js`
    - **Important**: Encode spaces with `%20`
- **@updateURL**: Same as `@downloadURL`

#### Execution

- **@match**: URL(s) where the script should run
    - Use precise patterns
    - Add multiple @match if needed for different domains
- **@icon**: Service favicon
    - Recommended format: `https://www.google.com/s2/favicons?domain=example.com`
    - Or with size: `https://www.google.com/s2/favicons?sz=64&domain=example.com`
- **@grant**: Required permissions
    - `none` if no special permissions
    - Otherwise, list the GM\_ APIs used (e.g.: `GM_registerMenuCommand`, `GM_getValue`, `GM_setValue`)
- **@run-at**: Generally `document-end`

### Empty Line

**Important**: Leave an empty line after the @version section and before @homepageURL if you use special grants (as in the Instagram example).

## File Naming Convention

Files must follow the format: `[Service] Description.user.js`

Examples:

- `[Amazon] Tweaks.user.js`
- `[GitHub] Inactive.user.js`
- `[Instagram] Tweaks.user.js`

## Pre-Commit Checklist

- [ ] Header follows the mandatory structure
- [ ] All mandatory fields are present
- [ ] Download URLs use `%20` for spaces
- [ ] Version number has been incremented
- [ ] README.md has been updated with:
    - [ ] Entry in the summary
    - [ ] Dedicated section with badge and description
- [ ] Script works correctly on @match URLs
- [ ] Code follows JavaScript best practices
- [ ] Script is tested in Tampermonkey

## Best Practices

1. **Strict mode**: Wrap code in an IIFE with `'use strict'`

    ```javascript
    (function () {
        'use strict';
        // Your code here
    })();
    ```

2. **Code organization**: Use classes or functions to structure the code

3. **Compatibility**: Test on different domains listed in @match

4. **Performance**: Optimize DOM selectors and avoid infinite loops

5. **Documentation**: Comment complex sections of the code

## Complete Example

See existing scripts as reference:

- [user.js/[Amazon] Tweaks.user.js](user.js/[Amazon]%20Tweaks.user.js)
- [user.js/[GitHub] Inactive.user.js](user.js/[GitHub]%20Inactive.user.js)
- [user.js/[Instagram] Tweaks.user.js](user.js/[Instagram]%20Tweaks.user.js)
