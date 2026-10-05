# Ahmed M. Sozzer

**Full-stack engineer at FYCLabs**, a studio that builds products for startups · Austin, TX · [amsozzer.com](https://amsozzer.com)

My C++17 HTTP framework **PlusWeb** is published in [Microsoft's vcpkg registry](https://github.com/microsoft/vcpkg/tree/master/ports/amsozzer1-plusweb): `vcpkg install amsozzer1-plusweb`.

[![Portfolio](https://img.shields.io/badge/Portfolio-amsozzer.com-blue)](https://amsozzer.com) [![LinkedIn](https://img.shields.io/badge/LinkedIn-amsozzer1-0077B5)](https://linkedin.com/in/amsozzer1) [![Email](https://img.shields.io/badge/Email-ahmed@amsozzer.com-red)](mailto:ahmed@amsozzer.com)

---

## About

Full-Stack Engineer at **FYCLabs**, working directly with founders and their end users to take product concepts from whiteboard to production. I split my time between shipping customer-facing features and going a layer deeper than the framework: the infrastructure, tooling, and automation that let a small team move fast.

I also build and deploy automation for small businesses whose owners don't write software, which means I see the work from the customer's side of the table: scoping with non-technical stakeholders, deploying into messy real environments, and owning the outcome rather than the ticket.

Austin, TX.

## What I Do

- Ship full-stack production apps end to end: frontend, API, database, deploy
- Work customer-facing: scoping with founders and end users, deploying on site, iterating from real feedback
- Go below the abstraction. I wrote my own HTTP framework in C++ to understand the layer I build on
- Reverse-engineer undocumented protocols when the vendor won't publish one
- Build AI-powered automation and workflow tooling (n8n, GoHighLevel, ElevenLabs, Twilio)

## Featured Projects

### AMS-X · Open Modular Filament System for Bambu Lab Printers

[Repository](https://github.com/Amsozzer1/AMS)

Bambu's own AMS holds 4 slots, 16 with the hub. Past that, every material change means a person at the printer. AMS-X removes the cap by running the printer in **external-spool mode** (where it already pauses and waits for a person) and automating the person instead. The spool count becomes unbounded.

A server owns the job: it parses the sliced 3MF into a **swap plan** (every pause and the filament index it's waiting on), pushes the file over LAN FTPS, starts the print over MQTT, and watches the live report stream. Every pause is **validated against the plan** before anything moves: a stray user pause never triggers a swap. A state machine then runs it: retract, select, feed, wait for the printer's own filament sensor to trip, resume. It drives Bambu's existing change routine rather than authoring hotend gcode, so the printer keeps owning the physics it already knows.

The spool module is an **interface, not a device**: a human implementation today, a stepper (TMC2209, ~16 modules per ESP32 on the same MQTT bus) next. Same contract, so the hardware drops into a system that already runs.

Bambu doesn't document the local protocol. Community notes ([OpenBambuAPI](https://github.com/Doridian/OpenBambuAPI), [ha-bambulab](https://github.com/greghesp/ha-bambulab)) cover part of it, and I confirmed the rest on my own A1 mini and P1S.

**Tech:** Python, FastAPI, MQTT (Mosquitto), ESP32, Docker

### PlusWeb · Express-style HTTP Framework in C++

[Repository](https://github.com/Amsozzer1/PlusWeb)

An HTTP framework written in C++17 on a libuv event loop and the llhttp parser, built to understand what actually happens between the socket and the handler. Express-style API: `app.GET`, `app.use`, mountable routers.

- **Segment-trie router** keyed by `METHOD:/path/segments`: a lookup costs one step per path segment instead of a scan over every route. Literal segments beat parameters (`/users/new` over `/users/:id`).
- **Middleware chain** with `next()` continuations that can short-circuit a request, plus path-scoped middleware and nested-router path rewriting.
- **Concurrency:** a single libuv event loop, keep-alive by default. 4.8x Express on a small app, flat from 5 routes to 10,000 where Express degrades 50x, and no connection left unanswered at any concurrency tested.
- **Tested like a real library:** unit tests plus an integration suite that boots a live server and drives it over loopback. CI builds on Linux and macOS, verifies the install target, and re-runs everything under AddressSanitizer and UBSan with leak detection.

In Microsoft's [vcpkg registry](https://github.com/microsoft/vcpkg/tree/master/ports/amsozzer1-plusweb): `vcpkg install amsozzer1-plusweb`. MIT licensed. The roadmap is public and honest about what's missing: no TLS, no body size limits, no idle timeouts.

**Tech:** C++17, libuv, llhttp, CMake, GoogleTest, GitHub Actions

## Experience

### FYCLabs · Full Stack Engineer (Engineer II)

**May 2025 – Present · Remote (Austin, TX)**

- Insurance platform: proved the carrier was silently dropping our policy photos, ran the weekly call with the carrier, and built overnight BullMQ jobs that re-check every policy and resubmit what was dropped
- Education network sign-on: one login across 3 new and 4 legacy portals, used by 50,000+ people a day; its own Next.js app on one Amplify deployment
- Women's health app: built the React Native app from zero to launch and still own it, including onboarding and community, frontend and backend
- GoHighLevel, Zoho and HubSpot integrations over REST and webhooks; CI/CD on GCP; ships to production several times a week

### Holiday Channel · Full Stack and iOS Developer

**Jan 2025 – May 2025 · Remote**

- Built the store solo in React Native during my last UIUC semester, from checkout through order fulfillment, and took the iOS app to App Store release

### Luminii LLC · Data Analyst and Software Intern

**May 2024 – Aug 2024 · Niles, IL**

- Replaced a manual pricing recalibration with an ML pricing model on live supplier data, and reindexed the database under it

## Technical Stack

**Languages** TypeScript, JavaScript, SQL, Python, C++17
**Frontend** React, Next.js, React Native, Expo
**Backend** Node.js, Express, FastAPI, PostgreSQL, Prisma, Redis, BullMQ, REST, webhooks, MQTT
**Cloud and tooling** GCP, AWS Amplify, Firebase, Docker, CI/CD, Linux, Jest, Cypress, GoogleTest
**AI-assisted development** Claude Code daily, with a spec review before any code and hooks and CI gating each change

## Education

**University of Illinois Urbana-Champaign** · B.S. Computer Science, May 2025
**Wilbur Wright College** · A.S., highest honors · CS and calculus tutor

## Contact

**Website:** [amsozzer.com](https://amsozzer.com) · **Email:** ahmed@amsozzer.com
**LinkedIn:** [linkedin.com/in/amsozzer1](https://linkedin.com/in/amsozzer1) · **GitHub:** [github.com/Amsozzer1](https://github.com/Amsozzer1)
