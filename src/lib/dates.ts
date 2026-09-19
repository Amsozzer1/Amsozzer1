import { execFileSync } from 'node:child_process';

const buildTime = new Date().toISOString();

export const lastModified = (...files: string[]): string =>
  execFileSync('git', ['log', '-1', '--format=%cI', '--', ...files], { encoding: 'utf8' }).trim() ||
  buildTime;

// Every date here arrives as "YYYY-MM": resume.json months and site.availability.since.
const asDate = (date: string) => new Date(`${date}-01T00:00:00Z`);

const month = (date: string, format: 'short' | 'long') =>
  asDate(date).toLocaleDateString('en-US', { month: format, timeZone: 'UTC' });

const year = (date: string) => date.slice(0, 4);

export const monthYear = (date: string) => `${month(date, 'short').toLowerCase()} ${year(date)}`;

export const monthYearLong = (date: string) => `${month(date, 'long')} ${year(date)}`;

// A range inside one year prints the year once: "jan → may 2025".
export const periodLabels = (start: string, end?: string) => ({
  start: end && year(end) === year(start) ? month(start, 'short').toLowerCase() : monthYear(start),
  end: end ? monthYear(end) : 'now',
});
