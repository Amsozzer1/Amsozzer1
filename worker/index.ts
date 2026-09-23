import { handleLink } from './links.ts';
import { documentHeaders, markdownResponse, wantsMarkdown } from './markdown.ts';

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

    return documentHeaders(request, await env.ASSETS.fetch(request));
  },
} satisfies ExportedHandler<Env>;
