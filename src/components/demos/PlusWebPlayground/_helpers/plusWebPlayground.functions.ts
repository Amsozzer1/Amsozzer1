import type { Method } from '@src/components/demos/PlusWebPlayground/_helpers/plusWebPlayground.consts';

export interface Route {
  method: Method;
  pattern: string;
}

// Only app.METHOD("...") reaches the router. Anything else in the box is ignored.
export const routesFrom = (code: string): Route[] =>
  [...code.matchAll(/app\.(?<verb>GET|POST|PUT|PATCH|DELETE)\(\s*"(?<pattern>[^"]*)"/g)].map(
    call => ({
      method: (call.groups?.verb ?? 'GET') as Method,
      pattern: call.groups?.pattern ?? '/',
    }),
  );
