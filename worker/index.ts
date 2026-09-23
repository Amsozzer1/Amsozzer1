import { handleLink } from './links.ts';
import { documentHeaders, markdownResponse, wantsMarkdown } from './markdown.ts';
import { logRead } from './views.ts';

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  LINK_SALT?: string;
}

export default {
  fetch: async (request, env, ctx) => {
    const url = new URL(request.url);

    // Both hosts answered 200, so every page had two crawlable URLs. _redirects
    // cannot do this: on Workers assets it only accepts relative paths.
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname.startsWith('/r/')) {
      return handleLink(request, env.DB, env.LINK_SALT, ctx);
    }

    if (wantsMarkdown(request)) {
      const markdown = await markdownResponse(request, env.ASSETS);
      if (markdown) return markdown;
    }

    const document = documentHeaders(request, await env.ASSETS.fetch(request));

    return logRead(request, document, env.DB, env.LINK_SALT, ctx);
  },
} satisfies ExportedHandler<Env>;
