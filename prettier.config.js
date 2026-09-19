export default {
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  arrowParens: 'avoid',
  printWidth: 100,
  plugins: ['prettier-plugin-astro'],
  astroCompressHTML: 'html',
  overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
};
