import { accent, muted, type Line } from '@src/components/home/_helpers/terminalLines.functions';
import { facts } from '@src/data/facts';

const { port } = facts.plusweb;
const { sampleReport, states } = facts.amsx;

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
