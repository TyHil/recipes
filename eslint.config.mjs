import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['js/parse.js', 'js/regex.js', 'js/token.js'],
    languageOptions: {
      ecmaVersion: 6,
      sourceType: 'module'
    }
  },
  eslintConfigPrettier
];
