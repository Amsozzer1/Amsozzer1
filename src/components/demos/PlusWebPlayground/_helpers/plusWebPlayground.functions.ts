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
const types = new Set(['HttpServer', 'HttpRequest', 'HttpResponse', 'Router', 'json']);
const objects = new Set(['app', 'req', 'res']);

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

// Each handler runs from its app.METHOD( call to the next one; its status is the first
// res.status(). Only the method and the pattern reach the router — the bodies are not compiled.
export const routesFrom = (code: string): Route[] => {
  const calls = [...code.matchAll(/app\.(?<verb>GET|POST|PUT|PATCH|DELETE)\("(?<pattern>[^"]*)"/g)];
  return calls.map((call, index) => {
    const handler = code.slice(call.index, calls[index + 1]?.index);
    const status = /res\.status\((?<code>\d{3})\)/.exec(handler)?.groups?.code;
    return {
      method: (call.groups?.verb ?? 'GET') as Method,
      pattern: call.groups?.pattern ?? '/',
      status: status ? Number(status) : 200,
    };
  });
};
