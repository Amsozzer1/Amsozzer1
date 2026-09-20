export interface Version {
  version: string;
  commit: string;
  builtAt: string;
}

export interface Dispatch {
  matched: boolean;
  routeId: number;
  params: Record<string, string>;
  ms: number;
  pattern?: string;
}

export interface TrieNode {
  value: string;
  isLeaf: boolean;
  isParameter: boolean;
  parameterName?: string;
  hasHandler: boolean;
  children: TrieNode[];
}

export interface TrieDump {
  root: TrieNode;
  routeCount: number;
  routes: { routeId: number; route: string }[];
}

export interface Router {
  version: () => Version;
  reset: () => void;
  registerRoute: (method: string, pattern: string) => number;
  dispatch: (method: string, path: string) => Dispatch;
  benchDispatch: (method: string, path: string, iterations: number) => number;
  dumpTrie: () => TrieDump;
}

// Vendored from the PlusWeb release by scripts/fetch-plusweb.ts, under a directory named for the
// build. The path is computed so the bundler leaves it alone: these files ship from public/.
let router: Promise<Router> | undefined;

export const loadRouter = (base: string) => {
  router ??= import(/* @vite-ignore */ `${base}/plusweb.mjs`).then(
    (module: { loadPlusWeb: () => Promise<Router> }) => module.loadPlusWeb(),
  );
  return router;
};
