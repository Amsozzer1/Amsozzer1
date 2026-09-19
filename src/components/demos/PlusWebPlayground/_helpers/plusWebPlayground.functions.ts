import type { Method } from '@src/components/demos/PlusWebPlayground/_helpers/plusWebPlayground.consts';

export type TokenKind = 'keyword' | 'type' | 'object' | 'string' | 'number' | 'comment' | 'plain';

export interface Token {
  kind: TokenKind;
  text: string;
}

export interface Route {
  method: Method;
  pattern: string;
  status: number;
}

const keywords = new Set(['auto', 'const', 'return', 'true', 'false', 'nullptr', 'include']);
const types = new Set(['App', 'Router', 'Request', 'Response']);
const objects = new Set(['app', 'req', 'res', 'pw']);

const verbs: Record<string, Method> = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  patch: 'PATCH',
  del: 'DELETE',
};

const tokenPattern =
  /(?<comment>\/\/.*)|(?<string>"(?:[^"\\]|\\.)*"?|<[\w/.]+>)|(?<word>[A-Za-z_]\w*)|(?<number>\d[\d.]*)|[^"\w/<]+|./g;

const wordKind = (word: string): TokenKind => {
  if (keywords.has(word)) return 'keyword';
  if (types.has(word)) return 'type';
  if (objects.has(word)) return 'object';
  return 'plain';
};

export const highlight = (line: string): Token[] =>
  Array.from(line.matchAll(tokenPattern), ({ 0: text, groups = {} }): Token => {
    if (groups.comment) return { kind: 'comment', text };
    if (groups.string) return { kind: 'string', text };
    if (groups.number) return { kind: 'number', text };
    if (groups.word) return { kind: wordKind(groups.word), text };
    return { kind: 'plain', text };
  });

// Each handler runs from its app.<verb>( call to the next one; its status is the first res.status().
export const routesFrom = (code: string): Route[] => {
  const calls = [...code.matchAll(/app\.(?<verb>get|post|put|patch|del)\("(?<pattern>[^"]*)"/g)];
  return calls.map((call, index) => {
    const handler = code.slice(call.index, calls[index + 1]?.index);
    const status = /res\.status\((?<code>\d{3})\)/.exec(handler)?.groups?.code;
    return {
      method: verbs[call.groups?.verb ?? 'get'],
      pattern: call.groups?.pattern ?? '/',
      status: status ? Number(status) : 200,
    };
  });
};
