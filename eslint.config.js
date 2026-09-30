// @ts-check
// `npm run lint` (ng lint). Formatting is Prettier's job (`npm run format:check`);
// these rules are about correctness and the project's Angular conventions.
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    // Type information, for rules such as no-uncalled-signals: each file is
    // checked with its own tsconfig (app, spec, e2e).
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['playwright.config.ts'] },
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      // The project's conventions (.claude/CLAUDE.md), checked rather than remembered.
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-signals': 'error', // input(), queries as signals
      '@angular-eslint/prefer-output-emitter-ref': 'error', // output(), not EventEmitter
      '@angular-eslint/prefer-output-readonly': 'error',
      '@angular-eslint/prefer-host-metadata-property': 'error', // `host: {}`, not @HostBinding/@HostListener
      '@angular-eslint/no-uncalled-signals': 'error', // `if (open)` instead of `if (open())`
      '@angular-eslint/use-injectable-provided-in': 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      // `@if` / `@for`, `[class.x]` rather than ngClass, NgOptimizedImage (CLAUDE.md).
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-class-binding': 'error',
      '@angular-eslint/template/prefer-ngsrc': 'error',
    },
  },
  {
    // Test doubles: empty functions (a fake observer's unobserve, a silenced spy) are the point.
    files: ['**/*.spec.ts', 'src/test-setup.ts', 'src/app/testing/**/*.ts', 'e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
]);
