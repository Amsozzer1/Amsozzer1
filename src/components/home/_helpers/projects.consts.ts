import type { ProjectSlug } from '@src/data/projects';

// The home list says each project in one paragraph. The project pages carry the detail.
export const blurbs: Partial<Record<ProjectSlug, string>> = {
  'ams-x':
    'Filament swaps for my print shop. A FastAPI server and a Next.js dashboard drive a Bambu printer over its local MQTT, with each swap planned from the sliced 3MF. A person still feeds the spool until the motor modules work.',
  plusweb:
    'An Express-style HTTP framework in C++17, in Microsoft’s vcpkg. I wrote the loop and the parser myself first, then moved them onto libuv and llhttp and kept the router and middleware. 4.8× Express at 5 routes, flat out to 10,000.',
  'pdf-redactor':
    'A task written to Terminal-Bench 3’s spec: redact court filings so nothing under the box is recoverable and nothing else changes. Claude Code and Codex scored 0 on all six runs.',
};
