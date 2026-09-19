import { facts } from '@src/data/facts';

const { sampleReport, stepperDriver } = facts.amsx;

export type SwapState = (typeof facts.amsx.states)[number];

export interface SwapStep {
  key: SwapState;
  title: string;
  note: string;
  actor: string;
  topic: string;
  request: string;
  expect: string;
  guard: string;
}

const printerTopic = 'device/+/request';
const moduleTopic = 'http · spool module';
const resumeSequence = String(Number(sampleReport.sequenceId) + 1);

// @TODO: numbers pass - the spool module's slot, feed length and rate are illustrative until the module profile is measured
export const swapSteps: SwapStep[] = [
  {
    key: 'retract',
    title: 'The plan says this layer changes material — so pause, and wait to be told it happened.',
    note: 'The server never assumes a command landed. It asks the printer to pause, then watches the report stream until the machine itself says it is paused.',
    actor: 'server → printer',
    topic: printerTopic,
    request: `{ "print": {\n    "command":     "pause",\n    "sequence_id": "${sampleReport.sequenceId}"\n} }`,
    expect: `{ "print": { "gcode_state": "${sampleReport.gcodeState}" } }`,
    guard: 'report.layer_num === plan[i].layer',
  },
  {
    key: 'select',
    title: 'Ask the spool module for the material the next layers need.',
    note: `The spool module is an interface, not a device. Today a human implements it; next it is a stepper driven by a ${stepperDriver} on an ESP32, and nothing above this line changes.`,
    actor: 'server → spool module',
    topic: moduleTopic,
    request: 'POST /spool/select\n{ "slot": 3, "material": "PETG-clear" }',
    expect: '{ "ok": true, "slot": 3 }',
    guard: 'plan[i].to in module.inventory',
  },
  {
    key: 'feed',
    title: 'Drive the new filament up to the extruder.',
    note: 'Feed length and rate come from the module profile, not from the printer. The server is coordinating here — it is not authoring motion for the hotend.',
    actor: 'spool module',
    topic: moduleTopic,
    request: 'POST /spool/feed\n{ "mm": 620, "rate_mm_s": 12 }',
    expect: '{ "fed_mm": 620, "state": "FED" }',
    guard: 'module.state === "SELECTED"',
  },
  {
    key: 'sense',
    title: 'Confirm the filament is actually there before anything resumes.',
    note: 'Nothing here runs on a timer. The runout sensor has to report present and settled, or the cycle stops and the print stays paused.',
    actor: 'sensor → server',
    topic: moduleTopic,
    request: 'GET /spool/sense',
    expect: '{ "present": true, "settled": true }',
    guard: 'sensor.present && sensor.settled',
  },
  {
    key: 'resume',
    title: 'Hand control back and let the printer run its own change routine.',
    note: 'This is the whole design decision: AMS-X drives the machine’s built-in filament-change behaviour instead of writing hotend gcode around it. Less to get wrong, and it survives firmware updates.',
    actor: 'server → printer',
    topic: printerTopic,
    request: `{ "print": {\n    "command":     "resume",\n    "sequence_id": "${resumeSequence}"\n} }`,
    expect: `{ "print": {\n    "gcode_state": "RUNNING",\n    "layer_num":   ${sampleReport.layer}\n} }`,
    guard: 'all previous states confirmed',
  },
];
