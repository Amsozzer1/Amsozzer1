import { accent, muted, type Line } from '@src/components/home/_helpers/terminalLines.functions';
import { facts } from '@src/data/facts';

const { port } = facts.plusweb;
const { sampleReport, states } = facts.amsx;
const { ladder, links } = facts.emberlink;
const [deep] = links;
const { runs, trackerMs } = facts.holdfast;
const heavy = runs[runs.length - 1];
const { stages } = facts.seamline;

export const curlSession: Line[] = [
  ['$ curl -i ', accent(`http://localhost:${port}/users/123`)],
  ['HTTP/1.1 200 OK'],
  ['Connection: keep-alive'],
  [],
  [
    '{ ',
    accent('"id"'),
    ': ',
    muted('"123"'),
    ', ',
    accent('"name"'),
    ': ',
    muted('"Ahmed"'),
    ' }',
  ],
  [],
  ['$ curl -i ', accent(`http://localhost:${port}/admin/x`)],
  ['HTTP/1.1 404 Not Found'],
];

export const printerReport: Line[] = [
  ['{ ', accent('"print"'), ': {'],
  ['    ', accent('"gcode_state"'), ': ', muted(`"${sampleReport.gcodeState}"`), ','],
  ['    ', accent('"layer_num"'), `:   ${sampleReport.layer},`],
  ['    ', accent('"sequence_id"'), ': ', muted(`"${sampleReport.sequenceId}"`)],
  ['} }'],
  [],
  states.map((state, index) => (index < states.length - 1 ? `${state} → ` : accent(state))),
];

export const linkReport: Line[] = [
  ['$ scripts/link.sh ', accent(deep.name), muted(`   # ${deep.detail}`)],
  [],
  ['stepping down on queueing delay'],
  ['  ', accent(ladder.join(' → ')), ' strips/s'],
  [],
  ['picture age  ', accent(deep.rows[0].age), muted('   p50 / p95')],
  ['alert        ', accent(deep.rows[0].alert)],
];

export const holdfastEval: Line[] = [
  ['$ ./holdfast --eval ', accent(heavy.input), muted(`   # ${heavy.detail}`)],
  [],
  ['           HOTA'],
  [`baseline   ${heavy.baseline.toFixed(1)}`],
  [`OC-SORT    ${heavy.ocsort.toFixed(1)}`],
  ['holdfast   ', accent(heavy.holdfast.toFixed(1))],
  [],
  ['tracker    ', accent(`${trackerMs} ms/frame`), muted('   the detector is the cost')],
];

export const seamPipeline: Line[] = stages.map((stage, index) =>
  index === stages.length - 1 ? [accent(stage)] : [stage, muted(' →')],
);
