export default [
    {
        // Environnements
        languageOptions: {
            ecmaVersion: 11,
            sourceType: 'script',
            globals: {
                // Pour browser: true
                window: 'readonly',
                document: 'readonly',
                // Pour greasemonkey: true
                GM: 'readonly',
                GM_addStyle: 'readonly',
                GM_getValue: 'readonly',
                GM_setValue: 'readonly',
                GM_xmlhttpRequest: 'readonly',
                unsafeWindow: 'readonly',
                // Pour jquery: true
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
        // Règles
        rules: {
            eqeqeq: 'warn',
            'linebreak-style': ['warn', 'unix'],
        },
    },
];
