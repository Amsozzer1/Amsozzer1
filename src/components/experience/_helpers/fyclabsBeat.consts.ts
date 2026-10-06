import { facts } from '@src/data/facts';

const { brokenPolicies, policiesChecked, newPortals, legacyPortals, dailyUsers, phenotypes } =
  facts.experience.fyclabs;

const count = (value: number) => value.toLocaleString('en-US');

export interface Track {
  id: string;
  // Matches the track name in resume.json, which carries the stack line.
  name: string;
  heading?: string;
  paragraphs: string[];
}

export const tracks: Track[] = [
  {
    id: 'insurance',
    name: 'Insurance platform',
    heading: 'The carrier was dropping our photos',
    paragraphs: [
      'I called the carrier’s endpoints directly in Postman, POST and GET, and went through the whole response, which listed every image attached to a policy. When I pulled the images themselves, most were empty structures with nothing stored in them. That was the proof that the carrier was silently dropping the photos we sent. After that I ran the weekly call with the carrier myself.',
      `The fix on our side was to stop trusting the handoff. Overnight BullMQ jobs re-check every policy against the carrier and resubmit whatever it dropped. They caught about ${brokenPolicies} broken policies out of roughly ${policiesChecked} that nobody had noticed, and anything odd now emails the team with its logs.`,
      'The slow queries got the same treatment: EXPLAIN ANALYZE to find them, composite indexes and raw SQL to fix them.',
    ],
  },
  {
    id: 'sign-on',
    name: 'Education network single sign-on',
    paragraphs: [
      `One login across ${newPortals} new portals and ${legacyPortals} legacy ones, used by ${count(dailyUsers)}+ students, teachers, principals, district leaders and admins a day. The sign-on is its own Next.js app: it checks each Firebase-signed token with Firebase, confirms the user can open that portal, and redirects them in.`,
      'The plan was a repo per portal. The portals share one theme, so I talked the PM and the senior engineers out of it, and built one monorepo on a single Amplify deployment where subdomains split each portal’s routes.',
    ],
  },
  {
    id: 'womens-health',
    name: 'Women’s health app',
    paragraphs: [
      `I built the React Native app from zero to launch and still own it. The client came back for a second phase. Front end and back end, I built the onboarding that places each user in one of ${phenotypes} phenotypes, and the community where doctors, other users and an AI bot steered by the lead doctor answer each post.`,
    ],
  },
];

export const alsoAtFyclabs =
  'On other client projects I wired GoHighLevel, Zoho and HubSpot into their backends over REST and webhooks, and set up CI/CD on GCP. I ship to production several times a week.';
