---
title: 'Putting a static site on Cloudflare Workers'
description: 'A Worker in front of static assets buys you things a static host cannot do. Here are the four config decisions that cost me the most time getting there.'
pubDate: 2026-09-22
tags: ['cloudflare', 'workers', 'edge', 'astro']
---

This site is static. Every page is HTML on disk, built ahead of time, with no JavaScript unless a
page carries a demo. That is exactly the kind of site that belongs on a plain static host, and for
a while it was on one.

It runs on [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) now,
because three things I wanted are things a static host cannot do:

- per-company tracking links, where `/r/stripe` records a visit and redirects
- content negotiation, so an agent asking for `text/markdown` gets markdown instead of HTML
- response headers that depend on the request, not just on the path

Workers with static assets gives you both halves: the assets are served by Cloudflare's asset
host, and a Worker sits in front only where you say so. Getting that "only where you say so" right
is most of the work.

## Do not run the Worker on everything

The obvious configuration is a Worker that handles every request and forwards what it does not
care about:

```jsonc
"assets": { "directory": "./dist", "binding": "ASSETS", "run_worker_first": true }
```

It works, and it is the wrong default. Static assets served without waking the Worker are free and
uncounted. With `run_worker_first: true`, every font, every image, every favicon becomes a Worker
invocation, and you have taken on a cost and a few milliseconds of latency for files you were
never going to do anything with.

`run_worker_first` takes an array of route patterns instead, so I list only the paths the Worker
has a reason to see:

```jsonc
"run_worker_first": [
  "/", "/about", "/experience", "/writing", "/writing/*",
  "/projects/*", "/uses", "/colophon", "/accessibility",
  "/r/*"
]
```

Documents and tracking links. The `.md` files, the fonts, the résumé PDF and the WebAssembly module
are all served straight from the asset host and the Worker never knows they were requested.

The cost is that the list is now a thing you can forget to update. I deleted a page and left its
route in that array for two days.

## A Worker script gets its own CSP, not the page's

One project page runs a WebAssembly module, which needs `'wasm-unsafe-eval'` in `script-src`. So I
put it on that page in `_headers`:

```
/projects/plusweb
  ! Content-Security-Policy
  Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval' …
```

That works for a module the page imports. It does **not** work for a Web Worker, and this is the
part worth remembering: a worker script's Content-Security-Policy comes from the HTTP response
that served the worker script, not from the document that started it. Put your worker in
`/_astro/` and it inherits whatever policy that path has, which will not be the one you carefully
wrote for the page.

The fix is to give the worker and its module their own path with their own rule. Mine live under
`/demos/plusweb/<commit>/`, which solves a second problem at the same time: because the directory
name changes whenever the build does, everything inside it can be `immutable, max-age=31536000`
without any chance of serving a stale module to someone on a fresh page.

I never hit this in production, because I checked the headers through `wrangler dev` before
deploying. It is the kind of thing that works locally under `file://` and fails only once it is
live.

## `html_handling` has to agree with your generator

Astro is configured here with `trailingSlash: 'never'`, so every canonical URL and every internal
link is `/writing`, not `/writing/`. The asset host has its own opinion, set by `html_handling`.

I had it on `auto-trailing-slash`, which was fine right up until I published a blog post. Adding
`writing/<slug>.html` next to `writing.html` made a path that was both a file and a directory, so
I switched the build to write `writing/index.html` instead. The moment `/writing` became an index
file, `auto-trailing-slash` started redirecting it to `/writing/`, which is the opposite of what
every canonical tag on the site says.

`drop-trailing-slash` is the setting that matches a never-trailing-slash site. `/writing` serves
200, and `/writing/` redirects to it rather than the other way round. If your generator has an
opinion about trailing slashes, the asset host needs the same one, or you get a redirect on every
page view and two URLs for every document.

## Write to D1 after you have answered

The tracking links insert a row and redirect. The naive version makes the visitor wait for a
database write before they get their redirect:

```ts
await recordVisit(db, slug, request);
return Response.redirect('/', 302);
```

`ctx.waitUntil` lets the Worker return immediately and finish the write afterwards:

```ts
if (SLUG.test(slug)) ctx.waitUntil(recordVisit(db, slug, request));

return new Response(null, {
  status: 302,
  headers: { Location: '/', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
});
```

Two other things in those five lines, both learned by thinking about what a URL like this invites.
Every slug redirects to `/` and nothing else, ever, which means the endpoint cannot be turned into
an open redirect no matter what somebody puts in the path. And `no-store` plus `noindex` keep it
out of caches and out of search results, because a tracking URL that gets indexed is a tracking
URL that stops telling you anything.

## Content negotiation is the part a static host cannot fake

The thing I actually wanted the Worker for: ask any page for `text/markdown` and you get markdown.

```
GET /about
Accept: text/markdown

200 OK
Content-Type: text/markdown; charset=utf-8
```

The conversion happens at build time, not at the edge. After the site builds, a script walks
`dist/**/*.html`, converts each page's `<main>` to markdown with front matter, and writes a `.md`
sibling. The Worker just picks which file to serve:

```ts
if (wantsMarkdown(request)) {
  const markdown = await markdownResponse(request, env.ASSETS);
  if (markdown) return markdown;
}
return documentHeaders(request, await env.ASSETS.fetch(request));
```

Doing it at build time rather than converting HTML at the edge means no CPU on the request path,
no parser in the Worker bundle, and output I can read and check into a diff.

Two headers make it correct rather than merely working. `Vary: Accept` on the HTML, because the
same URL now has two representations and a cache that does not know that will hand somebody the
wrong one. And `Link: </about.md>; rel="alternate"; type="text/markdown"` so a client can discover
the markdown exists instead of guessing at the path.

## What I would tell someone starting

Reach for Workers with static assets when you want _some_ dynamic behavior, not when you want a
server. The good version of this architecture is a static site where three or four paths do
something extra. If you find yourself adding `run_worker_first: true` and writing routing logic,
the site stopped being static a while ago and you should be honest about that.

And check your headers through `wrangler dev` before you deploy. Three of the four problems above
are invisible locally and invisible in the build output. They only exist in an HTTP response.

The whole thing is [open source](https://github.com/Amsozzer1/Amsozzer1). The Worker is under a
hundred lines across three files, and most of it is the markdown negotiation.
