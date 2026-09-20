---
title: 'I wrote an HTTP framework because I could not understand Express'
description: 'Middleware chaining made no sense to me, so I rebuilt it in C++. Two years later the profile said the slowest thing in my server was a map I rebuilt on every response.'
pubDate: 2026-09-20
tags: ['c++', 'http', 'performance', 'libuv']
---

I do not learn things by reading about them. I have tried. I can read a page on how something
works, nod along, and retain nothing. What I retain is what I have had to build, and usually what
I have had to build twice.

So when I joined FYCLabs and found that everything ran on Express, I had a problem. I understood
the low-level pieces — sockets, buffers, what the kernel is actually doing — but Express itself
was opaque to me. Middleware chaining in particular. Handlers calling `next()`, error handlers
that take four arguments instead of three, the order mattering in ways nobody wrote down. I could
use it. I could not have told you what it did.

The obvious move was to read the source. What I did instead was write my own.

## The first attempt was pointless

I started in JavaScript, which took about an evening to feel stupid. I was reimplementing the
thing I was trying to understand, in the same language, at the same level of abstraction. I
learned nothing except that I could produce something that looked like Express if I squinted.

So I started again in C++, where nothing could be borrowed and every piece had to be built. That
constraint is the entire value of the exercise. You cannot hand-wave a socket.

Somewhere in the middle of this I realised that Node is itself a C++ program wrapped around a C
event loop, which was a strange moment — I had gone down a level to understand the thing, and
found the thing was already there.

## What I found in Express

The first real discovery was not about middleware at all. It was routing.

Express matches a request by walking its layer stack in registration order and testing each one
until something matches. That is a linear scan. It means the cost of routing depends on where your
route happens to sit in the file, which is not a property I would have guessed a mature framework
had.

A trie made more sense to me. I started with one node per character, which is the version of a
trie everyone draws first, and it was wrong here — URLs are not arbitrary strings, they are a
small number of segments separated by slashes. One node per segment, keyed on `METHOD:/path`, and
the lookup costs one step per segment no matter how many routes exist.

That difference turned out to be most of the performance story against Express. Measured on one
pinned core, same handlers, same payloads:

| Routes registered | PlusWeb    | Express    |      |
| ----------------- | ---------- | ---------- | ---- |
| 5                 | 91,950 rps | 19,236 rps | 4.8× |
| 1,000             | 90,085 rps | 5,639 rps  | 16×  |
| 10,000            | 89,636 rps | 355 rps    | 253× |

The honest reading of that table is the top row. 4.8× is a small app, which is what most apps are,
and it is the case Express looks best under. The larger numbers are not PlusWeb getting faster —
it is flat at about 90,000 across every row — they are Express's router degrading. Quote 4.8×.

## Where I was wrong for about a year

I wanted to write everything myself. Not out of ambition exactly, more a feeling that using a
library for the interesting part was cheating. So I wrote my own event loop, which was not an
event loop at all — it was a `while` loop that blocked — and my own HTTP parser.

This is a bad instinct and it took me a while to see why. A project where you refuse to use
anything is a project that is permanently in development. It never reaches a first release,
because the parser is never finished, because parsers are never finished. You are not building
the thing you set out to build. You are building its dependencies, forever.

What broke the spell was watching [Tsoding](https://www.youtube.com/@TsodingDaily), who mentioned
libuv in passing. The obvious question arrived immediately: Node is built on libuv. I am trying to
understand Node. Why am I writing my own event loop?

So libuv replaced my blocking loop, and when profiling showed parsing was slow — for several
reasons that were entirely my own fault — [llhttp](https://github.com/nodejs/llhttp) replaced my
parser. It is the parser Node uses, it is tiny, and it does framing as well as parsing, which
meant pipelined requests and chunked bodies and requests split across packets all started working
at once. Adopting it closed every correctness gap I had against Express in a single commit.

## The slowest thing in my server

Then I profiled it properly, expecting the answer to be the blocking loop I had just removed.

It was a `std::map`.

`HttpResponse` carried the status-code table — 100 Continue, 200 OK, 404 Not Found, about sixty
entries — as a **member**:

```cpp
class HttpResponse {
    std::map<int, std::string> ResponseCodes = {
        {100, "Continue"},
        {101, "Switching Protocols"},
        // …sixty more
    };
};
```

Every response built that map from scratch. Sixty string allocations and sixty red-black tree
insertions, per request, to look up one value that never changes. The fix is one word:

```cpp
static const std::map<int, std::string>& defaultResponseCodes();
```

I measured it afterwards, compiling the commit and its parent with the same flags and running each
200,000 times:

|                             | before   | after   |          |
| --------------------------- | -------- | ------- | -------- |
| construct an `HttpResponse` | 3,390 ns | 10.0 ns | **339×** |
| full response path          | 3,400 ns | 255 ns  | 13×      |

Both versions emit byte-identical responses. The constructor got 339 times faster because it went
from doing sixty allocations to doing none. The whole path improved 13×, because once the map is
gone the remaining work — setting a status, serialising headers — is real work that still has to
happen.

## Where the time goes now

| flat % | symbol                                |
| ------ | ------------------------------------- |
| ~71%   | libc syscall stubs (`send`/`recv`)    |
| 3.0%   | `llhttp__internal__run`               |
| 1.8%   | `HttpParser::Impl::onMessageComplete` |
| 0.5%   | `HttpResponse::serialize`             |
| 0.5%   | `Node::find` — the routing trie       |

The router I spent most of my time on is half a percent. The framework as a whole is under ten
percent, and the rest is the kernel moving bytes. PlusWeb runs at 55% of what a bare epoll server
doing no parsing and no routing manages on the same machine; Express is at 3.9%.

That is the right place to end up, and it is also the end of the easy wins. Going faster from here
means making fewer syscalls, not writing faster C++.

## What it was actually for

I can now tell you exactly what Express does when a request arrives, because I have written the
thing that does it. Middleware chaining stopped being mysterious the moment I had to implement
`next()` myself — it is a linked list of functions where each one decides whether the next one
runs, and the four-argument error handler is just a different list.

That was the whole point. The benchmarks are a side effect, and a slightly misleading one: they
make it look like the project was about speed. It was about not being able to read a page and
understand it.

PlusWeb is [on GitHub](https://github.com/Amsozzer1/PlusWeb), MIT licensed, and there is a
[playground](/projects/plusweb) that runs the real router compiled to WebAssembly if you want to
watch the trie match something. It still has no TLS, no body size limits and no idle timeouts, so
please do not put it on the internet.
