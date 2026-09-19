import { handleLink } from './links.ts';

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
}

export default {
  fetch: (request, env, ctx) =>
    new URL(request.url).pathname.startsWith('/r/')
      ? handleLink(request, env.DB, ctx)
      : env.ASSETS.fetch(request),
} satisfies ExportedHandler<Env>;
