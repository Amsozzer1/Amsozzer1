# Ahmed M. Sozzer

**Forward Deployed Engineer | Full-Stack Engineer | Systems & Automation**

[![Portfolio](https://img.shields.io/badge/Portfolio-amsozzer.com-blue)](https://amsozzer.com) [![LinkedIn](https://img.shields.io/badge/LinkedIn-amsozzer1-0077B5)](https://linkedin.com/in/amsozzer1) [![Email](https://img.shields.io/badge/Email-ahmedsozzer9@gmail.com-red)](mailto:ahmedsozzer9@gmail.com)

---

## About

Full-Stack Engineer at **FYCLabs**, working directly with founders and their end users to take product concepts from whiteboard to production. I split my time between shipping customer-facing features and going a layer deeper than the framework — the infrastructure, tooling, and automation that let a small team move fast.

I also build and deploy automation for small businesses whose owners don't write software, which means I see the work from the customer's side of the table: scoping with non-technical stakeholders, deploying into messy real environments, and owning the outcome rather than the ticket.

Austin, TX.

## What I Do

- Ship full-stack production apps end to end — frontend, API, database, deploy
- Work customer-facing: scoping with founders and end users, deploying on site, iterating from real feedback
- Go below the abstraction — I wrote my own HTTP framework in C++ to understand the layer I build on
- Reverse-engineer undocumented protocols when the vendor won't publish one
- Build AI-powered automation and workflow tooling (n8n, GoHighLevel, ElevenLabs, Twilio)

## Featured Projects

### AMS-X — Open Modular Filament System for Bambu Lab Printers

[Repository](https://github.com/Amsozzer1/AMS)

Bambu Lab printers cap multi-material printing at four spools, so every material change means a human walks over and swaps a spool by hand. AMS-X removes the cap — not by fighting Bambu's proprietary AMS protocol, but by running the printer in **external-spool mode** (where it already pauses and waits for a person) and automating the person instead. The spool count becomes unbounded.

A server owns the job: it parses the sliced 3MF into a **swap plan** (every pause and the filament index it's waiting on), pushes the file over LAN FTPS, starts the print over MQTT, and watches the live report stream. Every pause is **validated against the plan** before anything moves — a stray user pause never triggers a swap. A state machine then runs it: retract, select, feed, wait for the printer's own filament sensor to trip, resume. It drives Bambu's existing change routine rather than authoring hotend gcode, so the printer keeps owning the physics it already knows.

The spool module is an **interface, not a device**: a human implementation today, a stepper (TMC2209, ~16 modules per ESP32 on the same MQTT bus) next. Same contract, so the hardware drops into a system that already runs.

None of the protocol is documented — the command set and report fields were worked out by trial and error against a live printer.

**Tech:** Python, FastAPI, MQTT (Mosquitto), ESP32, Docker

### PlusWeb — Express-style HTTP Framework in C++

[Repository](https://github.com/Amsozzer1/PlusWeb)

An HTTP framework written from scratch in C++17 on raw POSIX sockets, built to understand what actually happens between the socket and the handler. Express-style API: `app.GET`, `app.use`, mountable routers.

- **Segment-trie router** keyed by `METHOD:/path/segments` — a lookup costs one step per path segment instead of a scan over every route. Literal segments beat parameters (`/users/new` over `/users/:id`).
- **Middleware chain** with `next()` continuations that can short-circuit a request, plus path-scoped middleware and nested-router path rewriting.
- **Concurrency:** one acceptor thread feeding a bounded thread pool, keep-alive by default.
- **Tested like a real library:** unit tests plus an integration suite that boots a live server and drives it over loopback. CI builds on Linux and macOS, verifies the install target, and re-runs everything under AddressSanitizer and UBSan with leak detection.

Installable as a CMake package, MIT licensed. The roadmap is public and honest about what's missing — no TLS, no request size limits or timeouts, small read buffer.

**Tech:** C++17, CMake, POSIX sockets, GoogleTest, GitHub Actions

### Multi-Tenant AI Receptionist System

Business automation platform with lead-generation pipelines, Google Sheets integration, and AI-powered sales calling via ElevenLabs and Twilio. Multi-tenant by design, containerized with Docker, backed by PostgreSQL with Firebase auth. Built for real small-business clients — deployed, maintained, and iterated on directly with non-technical owners.

**Tech:** n8n, GoHighLevel, ElevenLabs, Twilio, PostgreSQL, Docker

### Real-Time Communication Platform

Full-stack app with real-time messaging over WebSockets, video calling via Stream SDK, and Firebase auth. React frontend with custom components; Node/Express backend handling concurrent WebSocket connections.

**Tech:** React, Node.js, Express, WebSockets, WebRTC, Firebase

## Experience

### FYCLabs — Full-Stack Engineer

**May 2025 – Present · Remote**

- Work directly with client founders, C-suite, and end users to scope requirements and surface pain points, then translate them into shipped features
- Build and ship full-stack applications for early-stage startups end to end — Next.js, React, TypeScript, PostgreSQL/Prisma, GCP
- Build cross-platform React Native apps from Figma designs, owning the API layer and data model
- Engineer CRM integrations against client backends (GoHighLevel, Zoho, HubSpot) over REST and webhooks
- Build CI/CD pipelines on GCP with test gates, taking releases from manual to push-button
- Scaled a backend from 700 to 5,000+ active users

### Holiday Channel — Full-Stack & iOS Developer

**Jan 2025 – May 2025 · Colorado Springs, CO**

- Built and shipped an e-commerce platform end to end, from checkout through fulfillment
- Designed the service architecture to absorb holiday-season traffic peaks
- Figma-to-code frontends with Google Ads integration

### Luminii LLC — Data Analyst & Software Intern

**May 2024 – Aug 2024 · Niles, IL**

- Built an ML-driven pricing system on real-time supplier data, replacing a manual re-calibration process
- Reindexed a 15,000+ record database and added automated data validation

## Technical Stack

**Languages** TypeScript, JavaScript, Python, C/C++ (C++17), Java
**Frontend** React, Next.js, React Native, TailwindCSS, Redux
**Backend** Node.js, Express, FastAPI, PostgreSQL, Prisma, MongoDB, Redis, GraphQL
**Systems** POSIX sockets, MQTT, multithreading, CMake, ESP32, Linux
**Infra & DevOps** Docker, GCP, CI/CD, GitHub Actions
**Automation & AI** n8n, GoHighLevel, Zapier, Make, ElevenLabs, Twilio

## Education

**University of Illinois Urbana-Champaign** — B.S. Computer Science, May 2025
**Wilbur Wright College** — A.E.S. Computer Science, High Honors

## Contact

**Website:** [amsozzer.com](https://amsozzer.com) · **Email:** ahmedsozzer9@gmail.com
**LinkedIn:** [linkedin.com/in/amsozzer1](https://linkedin.com/in/amsozzer1) · **GitHub:** [github.com/Amsozzer1](https://github.com/Amsozzer1)
