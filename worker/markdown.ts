const MARKDOWN = 'text/markdown';

// Every page is built to a .md sibling by scripts/build-markdown.ts.
const markdownPath = (pathname: string) =>
  pathname === '/' ? '/index.md' : `${pathname.replace(/\/$/, '')}.md`;

export const wantsMarkdown = (request: Request) =>
  request.headers.get('Accept')?.includes(MARKDOWN) ?? false;

export const markdownResponse = async (request: Request, assets: Fetcher) => {
  const url = new URL(request.url);
  const asset = await assets.fetch(new URL(markdownPath(url.pathname), url));
  if (!asset.ok) return null;

  const body = await asset.text();

  return new Response(body, {
    headers: {
      'Content-Type': `${MARKDOWN}; charset=utf-8`,
      'Cache-Control': 'public, max-age=0, must-revalidate',
      Vary: 'Accept',
      // The scanner asks for a count rather than an exact tokenisation; four characters per
      // token is the usual approximation.
      'X-Markdown-Tokens': String(Math.ceil(body.length / 4)),
      // The page, not its markdown twin, is the address worth indexing and citing.
      Link: `<${url.origin}${url.pathname}>; rel="canonical"`,
    },
  });
};

// Announce the markdown twin on the page itself, so an agent finds it without guessing the
// .md path or reading llms.txt first. Vary is here too: the same URL now answers with either
// representation, so caches have to key on Accept.
export const documentHeaders = (request: Request, response: Response) => {
  if (!response.headers.get('Content-Type')?.includes('text/html')) return response;

  const { pathname } = new URL(request.url);
  const announced = new Response(response.body, response);
  announced.headers.append('Vary', 'Accept');
  announced.headers.append(
    'Link',
    `<${markdownPath(pathname)}>; rel="alternate"; type="${MARKDOWN}"`,
  );
  return announced;
};
