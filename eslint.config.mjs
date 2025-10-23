import js from '@eslint/js'

export default [
  { files: ['**/*.js'] },
  { ignores: ['**/*.min.js'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        cancelAnimationFrame: 'readonly',
        clearInterval: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
        document: 'readonly',
        getComputedStyle: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        requestAnimationFrame: 'readonly',
        requestIdleCallback: 'readonly',
        ResizeObserver: 'readonly',
        sessionStorage: 'readonly',
        setInterval: 'readonly',
        setTimeout: 'readonly',
        URL: 'readonly',
        window: 'readonly'
      }
    },
    rules: {
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'eol-last': ['error', 'always']
    }
  }
]
