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
    },
  });
};

// The same URL now answers with HTML or markdown, so caches have to key on Accept.
export const varyOnAccept = (response: Response) => {
  if (!response.headers.get('Content-Type')?.includes('text/html')) return response;

  const varied = new Response(response.body, response);
  varied.headers.append('Vary', 'Accept');
  return varied;
};
