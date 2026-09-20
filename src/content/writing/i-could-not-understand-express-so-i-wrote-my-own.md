---
title: 'I could not understand Express, so I wrote my own'
description: 'Middleware chaining made no sense to me, so I rebuilt it in C++. A year later the profile said the slowest thing in my server was a map I rebuilt on every response.'
pubDate: 2026-09-20
tags: ['c++', 'http', 'performance', 'libuv']
---

I do not learn things by reading about them. I can read a page on how something works, nod along,
and retain none of it. What stays is what I have had to build, and usually what I have had to
build twice.

So when I joined FYCLabs and found that everything ran on Express, I had a problem. The low-level
pieces I was fine with: sockets, buffers, what the kernel is actually doing. Express itself was
opaque. Middleware chaining in particular. Handlers calling `next()`, error handlers taking four
arguments instead of three, ordering that mattered in ways nobody wrote down. I could use it. I
could not have told you what it did.

The sensible response was to read the source. I wrote my own instead.

## The first attempt was pointless

I started in JavaScript. That lasted about an evening. I was reimplementing the thing I was trying
to understand, in the same language, at the same level of abstraction, and learning nothing except
that I could produce something Express-shaped if I squinted.

So I started again in C++, where nothing can be borrowed and every piece has to be built. You
cannot hand-wave a socket.

## What I found in Express

The first real discovery had nothing to do with middleware. It was routing.

Express matches a request by walking its layer stack in registration order, testing each one until
something matches. That is a linear scan, which means the cost of routing depends on where your
route happens to sit in the file. I would not have guessed a mature framework had that property.

A trie made more sense. My first version put one node per character, which is the trie everybody
draws first and the wrong one here. URLs are not arbitrary strings. They are a small number of
segments separated by slashes. One node per segment, keyed on `METHOD:/path`, and a lookup costs
one step per segment however many routes exist.

That difference is most of the performance story against Express. One pinned core, identical
handlers, identical payloads:

| Routes registered | PlusWeb    | Express    |      |
| ----------------- | ---------- | ---------- | ---- |
| 5                 | 91,950 rps | 19,236 rps | 4.8× |
| 1,000             | 90,085 rps | 5,639 rps  | 16×  |
| 10,000            | 89,636 rps | 355 rps    | 253× |

The honest row is the first one. A five-route app is what most apps are, and it is the case
Express looks best under. The larger multiples are not PlusWeb speeding up, since it sits at about
90,000 across every row. They are Express's router degrading. If you quote one number, quote 4.8×.

## Where I was wrong for about a year

I wanted to write everything myself. Less ambition than a feeling that using a library for the
interesting part was cheating. So I wrote my own event loop, which was not an event loop at all
but a `while` loop that blocked, and my own HTTP parser.

It took me a year to see why that is a bad instinct. A project that refuses to use anything never
reaches a first release. You stop building the thing you set out to build and start maintaining
its dependencies instead.

What broke it was a detour. I had put PlusWeb down and started writing a JavaScript interpreter,
which meant reading how Node actually works and trying to imitate V8's parser. Two things came out
of that. The first was realising Node is itself a C++ program wrapped around a C event loop: I had
gone down a level to understand the thing and found the thing was already there. The second was
watching [Tsoding](https://www.youtube.com/@TsodingDaily) mention libuv in passing, which made the
question obvious. Node is built on libuv. I am trying to understand Node. Why am I writing my own
event loop?

libuv replaced the blocking loop. When profiling then showed parsing was slow, for several reasons
that were entirely my own fault, [llhttp](https://github.com/nodejs/llhttp) replaced my parser. It
is the parser Node uses, it is small, and it handles framing as well as parsing, so pipelined
requests, chunked bodies and requests split across packets all started working at once. Adopting
it closed every correctness gap I had against Express.

## The slowest thing in my server

Then I profiled properly, expecting the answer to be the blocking loop I had just removed.

It was a `std::map`.

`HttpResponse` carried the status-code table, eighty-five entries running from 100 Continue to 598, as a
member:

```cpp
class HttpResponse {
    std::map<int, std::string> ResponseCodes = {
        {100, "Continue"},
        {101, "Switching Protocols"},
        // …eighty-three more
    };
};
```

Every response built that map from scratch. Eighty-five string allocations and eighty-five red-black
tree insertions per request, to look up one value that never changes. The fix is one word:

```cpp
static const std::map<int, std::string>& defaultResponseCodes();
```

I measured it afterwards rather than trusting the memory of it, compiling the commit and its
parent with the same flags and running each 200,000 times:

|                             | before   | after   |          |
| --------------------------- | -------- | ------- | -------- |
| construct an `HttpResponse` | 3,390 ns | 10.0 ns | **339×** |
| full response path          | 3,400 ns | 255 ns  | 13×      |

Both versions emit byte-identical responses. The constructor is 339 times faster because it went
from eighty-five allocations to none. The full path improved 13×, since once the map is gone the
remaining work is work that genuinely has to happen.

## Where the time goes now

| flat % | symbol                                |
| ------ | ------------------------------------- |
| ~71%   | libc syscall stubs (`send`/`recv`)    |
| 3.0%   | `llhttp__internal__run`               |
| 1.8%   | `HttpParser::Impl::onMessageComplete` |
| 0.5%   | `HttpResponse::serialize`             |
| 0.5%   | `Node::find`, the routing trie        |

The router I spent most of my time on is half a percent. The framework as a whole is under ten
percent and the rest is the kernel moving bytes. PlusWeb runs at 55% of what a bare epoll server
doing no parsing and no routing reaches on the same machine. Express is at 3.9%.

That is the right place to end up and it is also the end of the cheap wins. Going faster now means
making fewer syscalls, not writing faster C++.

## What it was actually for

I can tell you what Express does when a request arrives, because I have written the thing that
does it. Middleware stopped being mysterious the moment I had to implement `next()`: it is a list
of functions where each one decides whether the next runs, and the four-argument error handler is
a second list.

That was the point. The benchmarks are a side effect, and a slightly misleading one, because they
make the project look like it was about speed. It was about not being able to read a page and
understand it.

PlusWeb is [on GitHub](https://github.com/Amsozzer1/PlusWeb) under MIT, and the
[playground](/projects/plusweb) runs the real router compiled to WebAssembly if you want to watch
a trie match something.
