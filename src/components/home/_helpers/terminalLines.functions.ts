type Tone = 'accent' | 'muted';

export type Segment = string | { text: string; tone: Tone };
export type Line = Segment[];

export const accent = (text: string): Segment => ({ text, tone: 'accent' });
export const muted = (text: string): Segment => ({ text, tone: 'muted' });
