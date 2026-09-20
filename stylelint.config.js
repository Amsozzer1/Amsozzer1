export default {
  extends: ['stylelint-config-standard', 'stylelint-config-html/astro'],
  rules: {
    'color-no-hex': true,
    'color-named': 'never',
    'declaration-no-important': true,
    'import-notation': 'string',
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla'],
    // Astro's escape hatch for elements a demo builds at runtime, which never carry its
    // scoping attribute.
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],
  },
  overrides: [
    {
      files: ['src/styles/tokens.css'],
      rules: {
        'color-no-hex': null,
        'function-disallowed-list': null,
      },
    },
  ],
};
