export const colors = {
  groundPaper: '#F4F3EF',
  groundGrid: '#E6E4DE',
  groundBody: '#E9E7E1',
  groundStone: '#DDDAD2',
  groundInk: '#0A0A0A',
  groundInkRaised: '#141412',
  text: '#0A0A0A',
  textBody: '#35342F',
  textSecondary: '#46443E',
  textCaption: '#5E5C57',
  textOnInk: '#F2F1EC',
  textOnInkMuted: '#9A978F',
  textOnInkSubtle: '#8A8880',
  ruleLight: '#C9C6BE',
  ruleInk: '#2A2A28',
  amber: '#E2A100',
  linkUnderlineProse: '#8A5A00',
  crop: '#A3A099',
  methodGet: '#1F6F3D',
  methodPost: '#8A5A00',
  methodDelete: '#A33A22',
  errorOnInk: '#E06A4E',
  tape: 'rgb(226 161 0 / 62%)',
  tapeEdgeLight: 'rgb(255 214 110 / 55%)',
  tapeEdgeDark: 'rgb(140 100 0 / 35%)',
  shadowImpact: 'rgb(10 10 10 / 20%)',
  tackRim: '#A87700',
  tackHighlight: '#FFD66E',
  tackRecess: '#B98600',
  tackPin: '#8C6400',
  shadowTack: 'rgb(10 10 10 / 28%)',
} as const;

export const fonts = {
  display:
    "'Redaction', 'Redaction Fallback Georgia', 'Redaction Fallback Times', 'Redaction Fallback Noto', serif",
  body: "'Uncut Sans', 'Uncut Sans Fallback Helvetica', 'Uncut Sans Fallback Arial', 'Uncut Sans Fallback Roboto', sans-serif",
  mono: "'Sozzer Mono', 'Sozzer Mono Fallback Menlo', 'Sozzer Mono Fallback Courier', 'Sozzer Mono Fallback Noto', ui-monospace, monospace",
  redacted: "'Redaction 70', 'Redaction Fallback Georgia', serif",
} as const;

// Font sizes scale linearly from the 390px phone board to the 1440px desktop board.
export const fontSizes = {
  display: { min: 48, max: 88 },
  displayProject: { min: 62, max: 108 },
  h2: { min: 32, max: 52 },
  h3: { min: 24, max: 36 },
  h4: { min: 20, max: 24 },
  lead: { min: 19, max: 22 },
  body: { min: 16.5, max: 18 },
  small: { min: 15, max: 16 },
  mono: { min: 12.5, max: 13 },
  monoSmall: { min: 12, max: 12 },
  link: { min: 13, max: 13.5 },
  code: { min: 12, max: 13.5 },
  note: { min: 14.5, max: 16 },
  stamp: { min: 12, max: 16 },
} as const;

export const tracking = {
  display: '-0.0189em',
  h2: '-0.0147em',
  h3: '-0.0126em',
  h4: '-0.0084em',
  wordmark: '-0.005em',
} as const;

export const leading = {
  display: '1.02',
  heading: '1.08',
  tight: '1.3',
  body: '1.58',
  mono: '1.6',
  code: '1.9',
} as const;

export const space = {
  '3xs': '0.25rem',
  '2xs': '0.5rem',
  xs: '0.75rem',
  s: '1rem',
  m: '1.5rem',
  l: '2rem',
  xl: '3rem',
  '2xl': '4rem',
  '3xl': '6rem',
  '4xl': '8rem',
} as const;

export const layout = {
  gutter: { min: 24, max: 64 },
  contentMax: '92rem',
  proseMax: '40rem',
  headerHeight: '5.25rem',
  heroMax: '50.125rem',
  amberBand: '0.875rem',
  targetMin: '2.75rem',
  graphCell: '1.75rem',
  markTapeWidth: '9.25rem',
  markTapeHeight: '2.0625rem',
  markTapeWidthCompact: '6.5rem',
  markTapeHeightCompact: '1.625rem',
  markTack: '1.625rem',
  markTackCompact: '1.5rem',
  markCrop: '0.9375rem',
  markCropInset: '1.625rem',
  footnoteMax: '22rem',
} as const;

export const rules = {
  major: '3px',
  figure: '2px',
  row: '1px',
  stamp: '2.5px',
  scribble: '2.2px',
  majorHighContrast: '4px',
  figureHighContrast: '3px',
  rowHighContrast: '2px',
} as const;

export const focus = {
  width: '3px',
  offset: '2px',
  halo: '3px',
} as const;

export const motion = {
  easeSlap:
    'linear(0, 0.1643 3.52%, 0.3108 7.17%, 0.4408 10.97%, 0.555 14.95%, 0.6535 19.1%, 0.738 23.5%, 0.8085 28.15%, 0.8662 33.12%, 0.9078 37.92%, 0.9405 43.12%, 0.9821 55.27%, 0.9976 70.1%, 1)',
  easeSlide: 'cubic-bezier(0.3333, 1, 0.6667, 1)',
  easeMark: 'cubic-bezier(0.25, 1, 0.5, 1)',
  easeTransition: 'cubic-bezier(0.65, 0, 0.35, 1)',
  pageTransition: '620ms',
} as const;
