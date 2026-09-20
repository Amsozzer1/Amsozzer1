import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori, { type Font } from 'satori';
import sharp from 'sharp';
import type { Card } from '@src/data/routes';
import { site } from '@src/data/site';
import { colors, tracking } from '@src/design/tokens';
import { cardSize } from '@src/lib/seo/meta';

type Style = Record<string, string | number>;

interface CardNode {
  type: 'div';
  props: { style: Style; children: (CardNode | string)[] };
}

// Satori takes React-shaped element objects; this builds them without pulling in React.
const h = (style: Style, ...children: (CardNode | string)[]): CardNode => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children },
});

// Satori cannot read woff2, so the cards use the original OTF masters.
const font = (file: string) => readFileSync(join(process.cwd(), 'fonts/masters', file));

const fonts: Font[] = [
  { name: 'Redaction', data: font('Redaction-Bold.otf'), weight: 700, style: 'normal' },
  { name: 'Uncut Sans', data: font('UncutSans-Regular.otf'), weight: 400, style: 'normal' },
  { name: 'Sozzer Mono', data: font('MonaspaceXenon-Regular.otf'), weight: 400, style: 'normal' },
];

const gridLines = `linear-gradient(to right, ${colors.groundGrid} 1px, transparent 1px), linear-gradient(to bottom, ${colors.groundGrid} 1px, transparent 1px)`;

export const renderCard = async ({ kicker, headline }: Card, { width, height } = cardSize) => {
  const card = h(
    {
      width,
      height,
      position: 'relative',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px 90px',
      backgroundColor: colors.groundPaper,
      backgroundImage: gridLines,
      backgroundSize: '28px 28px',
    },
    h({ fontFamily: 'Sozzer Mono', fontSize: 26, color: colors.textSecondary }, kicker),
    h(
      {
        maxWidth: 1000,
        fontFamily: 'Redaction',
        fontSize: headline.length > 40 ? 84 : 96,
        lineHeight: 1.02,
        letterSpacing: tracking.display,
        color: colors.text,
      },
      headline,
    ),
    h(
      { fontFamily: 'Uncut Sans', fontSize: 28, color: colors.textBody },
      `${site.name} · ${site.jobTitle}`,
    ),
    h({
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 18,
      backgroundColor: colors.amber,
    }),
    h({
      position: 'absolute',
      top: 40,
      right: -24,
      width: 148,
      height: 33,
      backgroundColor: colors.tape,
      transform: 'rotate(28deg)',
    }),
  );
  const svg = await satori(card, { width, height, fonts });
  return new Uint8Array(await sharp(Buffer.from(svg)).png().toBuffer());
};
