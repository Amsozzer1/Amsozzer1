import { facts } from '@src/data/facts';

interface JobSummary {
  role: string;
  lead: string;
  detail: string;
  stack: string[];
  outcome: string;
}

// The landing's short take on each job in resume.json, keyed by company name.
export const jobSummaries: Record<string, JobSummary> = {
  FYCLabs: {
    role: 'Full Stack Engineer',
    lead: 'I scope with client founders and end users directly, then ship it — web and mobile products on Postgres and GCP, and the release pipelines that carry them.',
    detail:
      'Two things recur: integrations against GoHighLevel, Zoho and HubSpot that delete an operations team’s manual data entry, and CI/CD with test gates running across several concurrent client projects.',
    stack: ['Next.js', 'React', 'TypeScript', 'PostgreSQL + Prisma', 'GCP', 'React Native'],
    outcome: `${facts.experience.fyclabs.growth} the users on the same backend — query and schema work, then scaled out`,
  },
  'Holiday Channel': {
    role: 'Full Stack & iOS',
    lead: 'An e-commerce platform end to end, built so the checkout path holds on the busiest week of the year.',
    detail:
      'Checkout through order fulfillment, with the service architecture designed to absorb holiday traffic without degrading the one path that is not allowed to degrade. Google Ads on the acquisition side.',
    stack: ['Next.js', 'Shadcn', 'Framer Motion', 'iOS'],
    outcome: 'shipped alongside my last semester at Illinois',
  },
  'Luminii LLC': {
    role: 'Data Analyst & Software Intern',
    lead: 'An ML pricing system on live supplier data, replacing a re-calibration somebody was doing by hand.',
    detail:
      'The pipeline sat on a database that had grown past its indexes, so that came with it — a reindex and automated validation underneath, which is what actually made the query times usable.',
    stack: ['Python', 'SQL', 'ML'],
    outcome: 'a manual re-calibration process, gone',
  },
};
