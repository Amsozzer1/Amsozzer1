import { projects, type Project, type ProjectSlug } from '@src/data/projects';

const words = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
];

export const count = (value: number) => value.toLocaleString('en-US');

// Copy spells small figures out ("a four-core box"), but they still come from facts.ts.
export const spell = (value: number): string => {
  if (value >= 1_000 && value % 1_000 === 0) return `${spell(value / 1_000)} thousand`;
  return words[value] ?? count(value);
};

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const projectBySlug = (slug: ProjectSlug): Project => {
  const project = projects.find(item => item.slug === slug);
  if (!project) throw new Error(`No project "${slug}" in src/data/projects.ts`);
  return project;
};
