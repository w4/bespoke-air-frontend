module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  // parserOptions: {
  // tsconfigRootDir: __dirname,
  // project: ['./tsconfig.json'],
  // },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'react-app',
    'react-app/jest',
    //'plugin:prettier/recommended'
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "no-case-declarations": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-empty-interface": "off"
  },
};
