/** @type {import('prettier').Config} */
module.exports = {
  endOfLine: 'lf',
  trailingComma: 'none',
  tabWidth: 2,
  singleQuote: true,
  jsxSingleQuote: true,
  // importOrder: [
  //     '(react/(.*)$)|^(react$)',
  //     "^components/(.*)$", "^[./]"
  // ],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
  importOrderBuiltModulesToTop: true,
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderMergeDuplicateImports: true,
  importOrderCombineTypeAndValueImports: true,
  plugins: ['@ianvs/prettier-plugin-sort-imports']
};
