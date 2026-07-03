import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  // android/ en ios/ zijn Capacitor-schillen met gegenereerde bridge-code
  { ignores: ['dist', 'node_modules', 'femflow-backend/node_modules', 'android', 'ios'] },

  // Frontend (browser, JSX)
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'warn',
      // Bestaand patroon in deze codebase (setState na localStorage-check in
      // effects); perf-advies, geen bug — bewust uit tot een refactor-ronde
      'react-hooks/set-state-in-effect': 'off',
      // Nieuwe compiler-checks van react-hooks v6 slaan aan op gangbare
      // patronen hier (let-accumulator in render, inline recharts-tooltip,
      // gehoiste functiedeclaraties in effects); geen bugs — uit
      'react-hooks/immutability': 'off',
      'react-hooks/static-components': 'off',
      // JSX-componentgebruik telt niet als "use" voor no-unused-vars zonder
      // eslint-plugin-react; hoofdletter-imports (componenten) uitsluiten
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },

  // Backend (Node)
  {
    files: ['femflow-backend/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_|^req|^res|^next' }],
    },
  },
]
