export const facts = {
  plusweb: {
    box: { cores: 4, expressProcesses: 4 },
    threads: { acceptors: 1, workers: 8 },
    port: 8080,
    dependencies: 1,
    stats: {
      speedup: '242×',
      requestsPerSecond: '93.3k',
      memory: '5.3 MB',
      libuv: '154k',
    },
    throughput: [
      { routes: 10, plusweb: 93_269, express: 20_117, ratio: '4.6×' },
      { routes: 1_000, plusweb: 92_298, express: 6_169, ratio: '15×' },
      { routes: 10_000, plusweb: 91_138, express: 376, ratio: '242×' },
    ],
    connections: 4,
    p99Ms: { plusweb: 0.1, express: 2.19, ratio: '21.9×' },
    memoryMb: { routes: 1_000, plusweb: 5.3, express: 573, ratio: '108×' },
    libuv: { connections: 128, plusweb: 154_620, express: 8_024 },
    resolveNs: { hit: 493, hitAt10kRoutes: 532, miss: 363, missAt10kRoutes: 146_431 },
    // @TODO: numbers pass - the landing terminal timings are drawn, replace them with a captured run
    transcript: [
      { method: 'GET', path: '/users/new', status: 200, ms: 1.9 },
      { method: 'GET', path: '/users/123', status: 200, ms: 2.4 },
      { method: 'POST', path: '/users', status: 201, ms: 3.1 },
      { method: 'GET', path: '/admin/metrics', status: 404, ms: 0.4 },
    ],
  },
  amsx: {
    stockSpools: 4,
    spools: 'n',
    states: ['retract', 'select', 'feed', 'sense', 'resume'],
    // @TODO: numbers pass - swap durations are planned, not measured; replace them with a filmed, timed cycle
    swap: {
      totalSeconds: 7.2,
      steps: [
        { name: 'retract', ms: 1_400 },
        { name: 'select', ms: 1_200 },
        { name: 'feed', ms: 2_200 },
        { name: 'sense', ms: 600 },
        { name: 'resume', ms: 1_800 },
      ],
    },
    benchMotors: 4,
    mqtt: { port: 8883, topic: 'device/+/report' },
    sampleReport: { gcodeState: 'PAUSE', layer: 48, sequenceId: '2041' },
    stepperDriver: 'TMC2209',
  },
  mnist: {
    dataset: { train: 60_000, test: 10_000 },
    layers: [
      { name: 'input', shape: [28, 28, 1] },
      { name: 'conv 3×3', shape: [26, 26, 32] },
      { name: 'maxpool', shape: [13, 13, 32] },
      { name: 'conv 3×3', shape: [11, 11, 64] },
      { name: 'maxpool', shape: [5, 5, 64] },
      { name: 'flatten', shape: [1_600] },
      { name: 'dense', shape: [64] },
      { name: 'softmax', shape: [10] },
    ],
    filters: [32, 64],
    kernel: 3,
    dense: 64,
    classes: 10,
    parameters: 121_834,
    checkpoint: { epoch: 3, file: 'epoch3.json' },
    // @TODO: numbers pass - 90% at epoch 3 needs retraining (expected 99% or better)
    testAccuracy: 0.9,
    padGrid: 16,
    // @TODO: numbers pass - the landing softmax bars are drawn, not a real model output
    sample: {
      digit: 3,
      bars: [
        { digit: 1, share: 0.05 },
        { digit: 2, share: 0.14 },
        { digit: 3, share: 1 },
        { digit: 5, share: 0.19 },
        { digit: 8, share: 0.26 },
      ],
    },
  },
  experience: {
    since: 2024,
    roles: 3,
    fyclabs: { usersBefore: 700, usersAfter: 5_000, growth: '7×' },
    deliveries: { services: 5, layerWeeks: 2, shipMonths: '<2', engineers: 2 },
    holidayChannel: { months: 5 },
    luminii: { records: '15,000+' },
  },
} as const;
