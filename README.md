# Ahmed M. Sozzer

**Forward Deployed Engineer | Full-Stack Engineer | Systems & Automation**

[![Portfolio](https://img.shields.io/badge/Portfolio-amsozzer.com-blue)](https://amsozzer.com) [![LinkedIn](https://img.shields.io/badge/LinkedIn-amsozzer1-0077B5)](https://linkedin.com/in/amsozzer1) [![Email](https://img.shields.io/badge/Email-ahmedsozzer9@gmail.com-red)](mailto:ahmedsozzer9@gmail.com)

---

## About

Full-Stack Engineer at **FYCLabs**, working directly with founders and early users to take product concepts from whiteboard to production. I split my time between shipping customer-facing features and going a layer deeper than the framework — building the infrastructure, tooling, and automation that make a small team move fast.

I also run **Plainform**, my own automation and print-on-demand operation, which means I see software from the customer's side of the table: scoping with non-technical stakeholders, deploying into messy real-world environments, and owning the outcome rather than the ticket.

Austin, TX.

## What I Do

- Ship full-stack production apps end to end — frontend, API, database, deploy
- Work customer-facing: scoping with founders/C-suite, deploying on-site, iterating from real feedback
- Go below the abstraction — I've written my own HTTP framework in C++ to understand the layer I build on
- Build AI-powered automation and workflow tooling (n8n, GoHighLevel, ElevenLabs, Twilio)

## Featured Projects

### PlusWeb — C++ HTTP Server Framework

[Repository](https://github.com/Amsozzer1/PlusWeb)

An Express-style HTTP framework written from scratch in C++ (~3,200 LOC), built to understand web servers from the socket up. Implements a **segment-trie router** with parameterized routes (exact matches beat params, e.g. `/user/me` over `/user/:id`), a **middleware chain** with `next()` continuations, and **mountable sub-routers** with path rewriting. Concurrency is handled by a bounded thread pool over keep-alive connections.

*Currently refactoring the request layer toward an epoll-based event loop and hardening the parser for large/streamed bodies.*

**Tech:** C++, Sockets, Multithreading

### Multi-Tenant AI Receptionist System

Business automation platform with lead-generation pipelines, Google Sheets integration, and AI-powered sales calling via ElevenLabs and Twilio. Multi-tenant by design, containerized with Docker, backed by PostgreSQL with Firebase auth. Built for real small-business clients through Plainform — deployed, maintained, and iterated on with non-technical owners.

**Tech:** n8n, GoHighLevel, ElevenLabs, Twilio, PostgreSQL, Docker

### Real-Time Communication Platform

Full-stack app with real-time messaging over WebSockets, video calling via Stream SDK, and Firebase auth. React frontend with custom components; Node/Express backend handling concurrent WebSocket connections at <100ms latency. Deployed on Render.

**Tech:** React, Node.js, Express, WebSockets, WebRTC, Firebase

### AMS — Automatic Material System *(in progress)*

Hardware + software system that routes M filament spools across N Bambu 3D printers — material multiplexing and job scheduling for my own print farm. Integrates with the printers over MQTT/LAN. A real engineer-builds-infra-for-their-own-business project; demo slice coming soon.

**Tech:** Embedded, MQTT, Scheduling, Bambu Lab integration

## Experience

### FYCLabs — Full-Stack Engineer
**May 2025 – Present · Remote**
- Architect full-stack solutions in Next.js, React, TypeScript, PostgreSQL/Prisma, and GCP
- Work directly with founders and end users to scope, ship, and iterate features
- Build CRM integrations across GoHighLevel, Zoho, and HubSpot
- Built CI/CD pipelines cutting deployment cycles ~70% at 95%+ reliability
- Scaled backend infrastructure from 700 to 5,000+ active users

### Holiday Channel — Full-Stack & iOS Developer
**Jan 2025 – May 2025 · Colorado Springs, CO**
- Built an e-commerce platform and microservices infrastructure designed for peak-traffic surges
- Shipped Figma-to-code frontends with Google Ads integration

### Luminii LLC — Data Analyst & Software Intern
**May 2024 – Aug 2024 · Niles, IL**
- Built an ML-driven automated pricing system, cutting manual re-calibrations ~40%
- Re-indexed a 15,000+ record database, improving query performance ~65%

## Technical Stack

**Languages** TypeScript, JavaScript, Python, C/C++, Java, Swift
**Frontend** React, Next.js, React Native, SwiftUI, TailwindCSS, Redux
**Backend** Node.js, Express, Django, PostgreSQL, Prisma, MongoDB, Redis, GraphQL
**Infra & DevOps** Docker, Kubernetes, GCP, AWS, CI/CD, Microservices
**Automation & AI** n8n, GoHighLevel, Zapier, Make, ElevenLabs, Twilio

## Education

**University of Illinois Urbana-Champaign** — B.S. Computer Science, May 2025
**Wilbur Wright College** — A.E.S. Computer Science, High Honors

## Contact

**Website:** [amsozzer.com](https://amsozzer.com) · **Email:** ahmedsozzer9@gmail.com
**LinkedIn:** [linkedin.com/in/amsozzer1](https://linkedin.com/in/amsozzer1) · **GitHub:** [github.com/Amsozzer1](https://github.com/Amsozzer1)
