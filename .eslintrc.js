module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  ignorePatterns: ['public/**/*'],
  overrides: [
    // JavaScript files
    {
      files: ['**/*.js'],
      env: {
        node: true,
        es2022: true,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    
    // HTML files
    {
      files: ['**/*.html'],
      plugins: ['html'],
      rules: {
        'html/indent': ['error', 2],
        'html/require-lang': 'error',
        'html/require-title': 'error',
      },
    },

    // CSS files
    {
      files: ['**/*.css'],
      plugins: ['css'],
      rules: {
        'css/no-dupe-properties': 'error',
        'css/property-no-unknown': 'error',
      },
    },

    // Markdown files
    {
      files: ['**/*.md', '**/*.markdown'],
      plugins: ['markdown'],
      processor: 'markdown/markdown',
    },

    // TOML files
    {
      files: ['**/*.toml'],
      plugins: ['toml'],
      parser: 'toml-eslint-parser',
      rules: {
        'toml/keys-order': 'error',
        'toml/tables-order': 'error',
      },
    },
  ],
};