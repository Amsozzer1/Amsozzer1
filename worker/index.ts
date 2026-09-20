import { handleLink } from './links.ts';
import { markdownResponse, varyOnAccept, wantsMarkdown } from './markdown.ts';

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
}

export default {
  fetch: async (request, env, ctx) => {
    if (new URL(request.url).pathname.startsWith('/r/')) {
      return handleLink(request, env.DB, ctx);
    }

    if (wantsMarkdown(request)) {
      const markdown = await markdownResponse(request, env.ASSETS);
      if (markdown) return markdown;
    }

    return varyOnAccept(await env.ASSETS.fetch(request));
  },
} satisfies ExportedHandler<Env>;
