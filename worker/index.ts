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
    if (new URL(request.url).pathname.startsWith('/r/')) {
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
