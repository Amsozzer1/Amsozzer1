export const facts = {
  plusweb: {
    // Every figure below is from the 2026-09-20 profile: one process, one thread, pinned to CPU 0,
    // against Express 5.2.1 on Node 25.6.1 pinned the same way, 32 keep-alive connections.
    box: { cores: 4, cpu: 'Intel i5-7600', os: 'Linux' },
    port: 3000,
    dependencies: 3,
    stats: {
      speedup: '4.8×',
      requestsPerSecond: '91.9k',
      memory: '4.6 MB',
      ceiling: '55%',
    },
    throughput: [
      { routes: 5, plusweb: 91_950, express: 19_236, ratio: '4.8×' },
      { routes: 1_000, plusweb: 90_085, express: 5_639, ratio: '16×' },
      { routes: 10_000, plusweb: 89_636, express: 355, ratio: '253×' },
    ],
    connections: 32,
    p99Ms: { plusweb: 0.545, express: 2.329, ratio: '4.3×' },
    worstCaseMs: { connections: 512, plusweb: 20.67, express: 4804.2, ratio: '232×' },
    starved: { connections: 512, plusweb: 0, express: 264 },
    memoryMb: { routes: 1_000, plusweb: 6.5, express: 97.7, ratio: '15×' },
    miss: { routes: 10_000, plusweb: 76_568, express: 393, ratio: '195×' },
    // A bare epoll server doing no parsing and no routing on the same box and the same pinning.
    ceiling: { requestsPerSecond: 164_736, plusweb: '55%', express: '3.9%' },
    profile: [
      { symbol: 'socket syscalls', percent: 71 },
      { symbol: 'llhttp', percent: 3.0 },
      { symbol: 'onMessageComplete', percent: 1.8 },
      { symbol: 'serialize', percent: 0.5 },
      { symbol: 'the routing trie', percent: 0.5 },
    ],
    // Where the advantage narrows, from the same profile.
    narrows: [
      { case: '100 KB response bodies', ratio: '4.5×' },
      { case: 'no keep-alive', ratio: '4.1×' },
      { case: '16 middleware', ratio: '5.2×' },
    ],
    // Captured on the machine in /uses, over loopback, as the mean of 2,000 requests per route on
    // one keep-alive connection after a warm-up. Higher than the 11 µs the benchmark box implies,
    // because the client here is Python and the transport is macOS loopback.
    transcript: [
      { method: 'GET', path: '/users/new', status: 200, ms: 0.041 },
      { method: 'GET', path: '/users/123', status: 200, ms: 0.038 },
      { method: 'POST', path: '/users', status: 201, ms: 0.039 },
      { method: 'GET', path: '/admin/metrics', status: 404, ms: 0.036 },
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
  emberlink: {
    // One seeded 90 s walkthrough replayed on every link preset, for Emberlink and two
    // baselines, in two network namespaces on one Linux host so both ends read the same
    // clock, with netem shaping both directions.
    scene: { width: 80, height: 60, hz: 9 },
    strip: { perFrame: 4, bytes: 1_200 },
    ladder: [36, 24, 16, 8, 4],
    kbps: { min: 40, max: 363 },
    alert: { repeats: 3, spacingMs: 50 },
    // If the operator's reports stop for this long, the sender drops to the lowest rung.
    stallMs: 600,
    // Picture age is the age of the oldest part of what the operator is looking at, sampled
    // every 100 ms. Both columns are p50 / p95.
    links: [
      {
        name: 'deep',
        detail: '100 kbps, 10% loss',
        rows: [
          { sender: 'Emberlink', age: '0.75 s / 1.27 s', alert: '125 ms / 140 ms' },
          { sender: 'TCP', age: '5.0 s / 6.9 s', alert: '4.3 s / 5.5 s' },
          { sender: 'naive UDP', age: 'never complete', alert: '768 ms / 890 ms' },
        ],
      },
      {
        name: 'blackout',
        detail: 'deep, plus two 3 s outages',
        rows: [
          { sender: 'Emberlink', age: '0.75 s / 2.6 s', alert: '159 ms / 1.9 s' },
          { sender: 'TCP', age: '5.0 s / 10.2 s', alert: '5.6 s / 8.9 s' },
          { sender: 'naive UDP', age: '15.9 s / 30.2 s', alert: '761 ms / 2.8 s' },
        ],
      },
      {
        name: 'wall',
        detail: '500 kbps, 3% loss',
        rows: [
          { sender: 'Emberlink', age: '206 ms / 339 ms', alert: '39 ms / 42 ms' },
          { sender: 'TCP', age: '340 ms / 514 ms', alert: '66 ms / 166 ms' },
          { sender: 'naive UDP', age: '3.0 s / 8.5 s', alert: '878 ms / 913 ms' },
        ],
      },
      {
        name: 'good',
        detail: '10 Mbps, the case it is not for',
        rows: [
          { sender: 'Emberlink', age: '85 ms / 261 ms', alert: '13 ms / 14 ms' },
          { sender: 'TCP', age: '206 ms / 334 ms', alert: '18 ms / 20 ms' },
          { sender: 'naive UDP', age: '82 ms / 129 ms', alert: '14 ms / 18 ms' },
        ],
      },
    ],
    // On a link with headroom, sending everything immediately is the right answer and naive UDP
    // gets there. Emberlink opens at the second-lowest rung and takes about six seconds to climb,
    // which is what the p95 is showing.
    rampSeconds: 6,
    recovery: { emberlink: '2.3 s and 0.6 s', tcp: 'never' },
  },

  holdfast: {
    // VisDrone2019-MOT val, 7 sequences from a moving drone camera. Detections are ground
    // truth plus seeded noise, so the table measures the tracker and not the detector.
    // Three sequences were used to tune; the other four were held out and scored once.
    dev: 3,
    heldOut: 4,
    // HOTA, higher is better. Baseline is ByteTrack-style; OC-SORT is the published reference.
    runs: [
      { input: 'clean', detail: 'no degradation', baseline: 62.5, ocsort: 52.3, holdfast: 69.0 },
      {
        input: 'blackout',
        detail: '15-30 frames lost every ~4 s',
        baseline: 42.9,
        ocsort: 37.2,
        holdfast: 50.5,
      },
      {
        input: 'freeze',
        detail: 'a frame repeats for 10-20',
        baseline: 49.4,
        ocsort: 41.2,
        holdfast: 59.5,
      },
      {
        input: 'heavy',
        detail: 'all of it, plus 30% dropout',
        baseline: 32.0,
        ocsort: 14.5,
        holdfast: 38.9,
      },
    ],
    // HOTA lost when each piece is removed from the full tracker. Each one helps where it
    // should and nowhere else, and one of them does nothing at all.
    ablation: [
      {
        piece: 'camera-motion compensation',
        clean: -6.5,
        blackout: -3.6,
        freeze: -4.2,
        heavy: -4.2,
      },
      { piece: 'timestamp-based dt', clean: 0, blackout: -2.7, freeze: 0, heavy: -1.5 },
      { piece: 'recovery stage', clean: -0.3, blackout: -1.8, freeze: -2.0, heavy: -1.0 },
      { piece: 'stale-frame guard', clean: 0, blackout: 0, freeze: -4.3, heavy: -0.4 },
      { piece: 'OC-SORT re-update', clean: -0.4, blackout: -0.2, freeze: 0.1, heavy: 0.2 },
    ],
    // The tracker is not the cost; the detector is. p50 over 300 frames of 1344x756.
    trackerMs: 0.09,
    fps: { oneCore: 26, twoCores: 39 },
    container: { mb: 242, arches: ['x86', 'ARM64'] },
    // A Mahalanobis gate on the first matching stage is the textbook move. It was measured
    // and removed.
    gateCost: 3,
  },

  seamline: {
    stages: ['spec', 'seams', 'sequence', 'review', 'release', 'run', 'fault', 'retry'],
    // One Rust crate compiled to WebAssembly twice: the browser validates on every keystroke,
    // the server re-checks every saved plan, and neither can drift from the other.
    wasmTargets: ['browser', 'node'],
    // Drawing the parts out caught this before the tests did.
    jointWeldsPerCrossing: { firstDraft: 2, correct: 4 },
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
