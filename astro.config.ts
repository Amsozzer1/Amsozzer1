import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://amsozzer.com',
  trailingSlash: 'never',
  compressHTML: true,
  build: {
    format: 'preserve',
    inlineStylesheets: 'never',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
      cssCodeSplit: false,
    },
  },
  markdown: {
    shikiConfig: {
      // Every token color in this theme, comments included, clears 6:1 on the #0A0A0A code panels.
      theme: 'github-dark-default',
    },
  },
});
