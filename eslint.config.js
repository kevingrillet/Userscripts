// CommonJS syntax instead of ESM
module.exports = [
    {
        ignores: ['[WIP]/**', 'lab/**', 'node_modules/**'],

        // Environnements
        languageOptions: {
            ecmaVersion: 11,
            sourceType: 'script',
            globals: {
                // browser: true
                window: 'readonly',
                document: 'readonly',
                // greasemonkey: true
                GM: 'readonly',
                GM_addStyle: 'readonly',
                GM_getValue: 'readonly',
                GM_setValue: 'readonly',
                GM_xmlhttpRequest: 'readonly',
                unsafeWindow: 'readonly',
                // jquery: true
                $: 'readonly',
                jQuery: 'readonly',
            },
            parserOptions: {
                ecmaFeatures: {
                    globalReturn: true,
                    impliedStrict: true,
                },
            },
        },
        rules: {
            eqeqeq: 'warn',
            'linebreak-style': ['warn', 'unix'],
        },
    },
];
