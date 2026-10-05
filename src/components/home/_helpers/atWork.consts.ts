interface Beat {
  title: string;
  credit: string;
  line: string;
  href: string;
}

export const atWork: Beat[] = [
  {
    title: 'Insurance platform',
    credit: 'sole engineer',
    line: 'Proved the carrier was silently dropping our policy photos, ran the weekly call with them, and built the nightly jobs that resubmit what they drop.',
    href: '/experience#insurance',
  },
  {
    title: 'Education sign-on',
    credit: 'SSO mine, portals with a team',
    line: 'One login for 3 new and 4 legacy portals, used by 50,000+ people a day.',
    href: '/experience#sign-on',
  },
  {
    title: "Women's health app",
    credit: 'with one other engineer',
    line: 'Built the React Native app from zero and still own it, with its onboarding and community, front and back end.',
    href: '/experience#womens-health',
  },
];
