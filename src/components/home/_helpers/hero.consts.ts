import { accent, muted, type Line } from '@src/components/home/_helpers/terminalLines.functions';
import { facts } from '@src/data/facts';

const { threads, transcript } = facts.plusweb;

// PlusWeb matches /users/123 against its /users/:id route, so the log shows the captured param.
const userRoute = /^\/users\/(\d+)$/;

// No-break spaces keep "1.9 ms" and ':id = "123"' whole when a narrow panel wraps the line.
const nbsp = '\u00A0';

export const serverLog: Line[] = [
  ['$ cmake --build build -j && ./plusweb'],
  [
    'listening ',
    muted(`— ${threads.acceptors} acceptor, ${threads.workers} workers, keep-alive on`),
  ],
  [],
  ...transcript.map(({ method, path, status, ms }) => {
    const id = userRoute.exec(path)?.[1];
    return [
      method.padEnd(7),
      accent(path),
      `${' '.repeat(18 - path.length)}${status}   ${ms.toFixed(1)}${nbsp}ms`,
      id ? muted(`   :id${nbsp}=${nbsp}"${id}"`) : '',
    ];
  }),
];
