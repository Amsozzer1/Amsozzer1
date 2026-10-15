---
title: 'How often public Supabase repos leave a table readable by the anon key'
description: 'I replayed the migration history of 1,000 public Supabase repos. 18.8% had a table the anon key could read at some point, and 10.9% still do.'
pubDate: 2026-10-16
tags: ['supabase', 'postgres', 'security', 'rls', 'lintel']
---

While going through some of my older projects, I found a Supabase table with row level security off. It came in with a PR I'd mostly vibe coded, and I'd never turned RLS on for it. Anyone holding the anon key could read it, and the anon key ships in the frontend bundle. I fixed it as soon as I saw it.

Then I wanted to know how common that is. So I replayed the migration history of 1,000 public Supabase repos into throwaway local databases and checked every table, commit by commit.

Short version: 18.8% of the repos I could replay had a fully readable table at some point, and 10.9% still have one at their latest commit.

## Why this happens

A Supabase frontend talks to Postgres through PostgREST, using the anon key. Supabase's default privileges grant `anon` `SELECT`, `INSERT`, `UPDATE` and `DELETE` on new tables in `public`. Row level security is the only thing standing between those grants and your rows.

The dashboard's table editor turns RLS on for new tables by default. A `create table` in a migration file doesn't:

```sql
create table public.messages (
  id bigint generated always as identity primary key,
  body text not null
);
-- no "alter table public.messages enable row level security;"
-- anon can now read and write every row
```

So the same table is safe or open depending on whether you made it in the UI or in SQL.

## What I measured

**Sample.** GitHub code search for `.sql` files under `supabase/migrations/`, sliced into 8 file-size bands to get past the API's 1,000-result cap. Every band hit the cap, so the frame is the first 1,000 hits in each band: 5,865 repos. I screened them in seeded random order and kept the first 1,000 that weren't forks, templates, tutorials or Supabase's own examples, and that had at least 3 migration files and 2 commits touching them.

**Replay.** For each repo, every commit that touched the migrations or `seed.sql`, capped at 30 (first, last and evenly spaced in between). Each commit was replayed into a fresh `supabase/postgres` container with no outbound network, using the same rules `supabase db push` uses. Nothing touched a live project, and no URL was visited.

**Exposure.** A table in `public` with RLS off, on which `anon` has table-level `SELECT`. That means every row and every column is readable with the public key.

## Results

|                                    | Repos      | Share | 95% CI        |
| ---------------------------------- | ---------- | ----- | ------------- |
| Exposed at any sampled commit      | 146 of 777 | 18.8% | 16.2 to 21.7% |
| Still exposed at the latest commit | 43 of 393  | 10.9% | 8.2 to 14.4%  |

The denominators differ because not every commit replays (more on that below). 777 repos had at least one commit that replays, and 393 had a latest commit that does.

When an exposure ended, it usually wasn't a quick fix in the next commit. 67% of the ones that ended lasted more than a day and 37% more than a week. Counting exposures that are still open, the median was 47 days (Kaplan–Meier, since open ones haven't finished yet). 22 of the 75 that ended did so at the very next migration commit.

<figure class="bar-chart">
<svg class="bar-chart-plot" height="27.3em" role="img" aria-labelledby="exposure-durations-title" aria-describedby="exposure-durations-desc">
<title id="exposure-durations-title">How long exposures lasted, per repo, ended and still open</title>
<desc id="exposure-durations-desc">Ended exposures, 75 in all: under 1 hour 8, 1 hour to 1 day 17, 1 to 7 days 22, 7 to 30 days 9, 30 to 90 days 13, 90 to 365 days 5, over 1 year 1. Still open, time so far, 86 in all: under 1 hour 17, 1 hour to 1 day 11, 1 to 7 days 8, 7 to 30 days 12, 30 to 90 days 17, 90 to 365 days 20, over 1 year 1.</desc>
<text class="bar-label" y="1em">Under 1 hour</text>
<rect class="bar-ended" x="0.5" y="1.4em" width="29.09%" height="0.8em"></rect>
<text class="bar-count" x="29.09%" y="1.8em" dx="0.5em">8 <tspan class="bar-series">ended</tspan></text>
<rect class="bar-open" x="0.5" y="2.4em" width="61.82%" height="0.8em"></rect>
<text class="bar-count" x="61.82%" y="2.8em" dx="0.5em">17 <tspan class="bar-series">still open</tspan></text>
<text class="bar-label" y="5em">1 hour to 1 day</text>
<rect class="bar-ended" x="0.5" y="5.4em" width="61.82%" height="0.8em"></rect>
<text class="bar-count" x="61.82%" y="5.8em" dx="0.5em">17</text>
<rect class="bar-open" x="0.5" y="6.4em" width="40%" height="0.8em"></rect>
<text class="bar-count" x="40%" y="6.8em" dx="0.5em">11</text>
<text class="bar-label" y="9em">1 to 7 days</text>
<rect class="bar-ended" x="0.5" y="9.4em" width="80%" height="0.8em"></rect>
<text class="bar-count" x="80%" y="9.8em" dx="0.5em">22</text>
<rect class="bar-open" x="0.5" y="10.4em" width="29.09%" height="0.8em"></rect>
<text class="bar-count" x="29.09%" y="10.8em" dx="0.5em">8</text>
<text class="bar-label" y="13em">7 to 30 days</text>
<rect class="bar-ended" x="0.5" y="13.4em" width="32.73%" height="0.8em"></rect>
<text class="bar-count" x="32.73%" y="13.8em" dx="0.5em">9</text>
<rect class="bar-open" x="0.5" y="14.4em" width="43.64%" height="0.8em"></rect>
<text class="bar-count" x="43.64%" y="14.8em" dx="0.5em">12</text>
<text class="bar-label" y="17em">30 to 90 days</text>
<rect class="bar-ended" x="0.5" y="17.4em" width="47.27%" height="0.8em"></rect>
<text class="bar-count" x="47.27%" y="17.8em" dx="0.5em">13</text>
<rect class="bar-open" x="0.5" y="18.4em" width="61.82%" height="0.8em"></rect>
<text class="bar-count" x="61.82%" y="18.8em" dx="0.5em">17</text>
<text class="bar-label" y="21em">90 to 365 days</text>
<rect class="bar-ended" x="0.5" y="21.4em" width="18.18%" height="0.8em"></rect>
<text class="bar-count" x="18.18%" y="21.8em" dx="0.5em">5</text>
<rect class="bar-open" x="0.5" y="22.4em" width="72.73%" height="0.8em"></rect>
<text class="bar-count" x="72.73%" y="22.8em" dx="0.5em">20</text>
<text class="bar-label" y="25em">Over 1 year</text>
<rect class="bar-ended" x="0.5" y="25.4em" width="3.64%" height="0.8em"></rect>
<text class="bar-count" x="3.64%" y="25.8em" dx="0.5em">1</text>
<rect class="bar-open" x="0.5" y="26.4em" width="3.64%" height="0.8em"></rect>
<text class="bar-count" x="3.64%" y="26.8em" dx="0.5em">1</text>
</svg>
<figcaption>How long exposures lasted, per repo. ‘Still open’ is the time so far at the last commit that replays. 161 exposures in 146 repos.</figcaption>
</figure>

## A few results worth a closer look

**Starred repos did worse.** Repos with 1 to 9 stars were exposed at their latest commit 20.3% of the time, against 8.3% for repos with no stars, and the intervals don't overlap. I wouldn't read that as cause. Starred repos tend to have longer histories, and every extra commit is another chance to add a table.

**Older repos weren't safer.** Repos created before 2026 were at 16.7% at their latest commit and 2026 repos at 9.5%, and that difference is within the intervals. If you wanted to pin this on AI coding tools, this data doesn't support it.

**Most latest commits don't replay at all.** Only 39% of repos had a latest commit that applies cleanly on a fresh database. Of the ones that fail, 69% fail because a migration refers to a table, column or function that doesn't exist yet, almost always because it was made in the dashboard. For those projects, the migration folder can't rebuild the database it's supposed to describe.

**Public reads are everywhere, and that's mostly fine.** 48.6% of repos had a `SELECT` policy for `anon` with `using (true)` on a table that does have RLS on. That's how a public profile page or a blog works. Supabase's own linter skips that pattern on purpose and only flags always-true write policies, which showed up in 9.3% of repos.

## Limits

- **Migrations aren't the live database.** A project can turn RLS on in the dashboard without a migration. Then it looks exposed here when it isn't. The reverse happens too.
- **The sample is young and small.** 72% of the repos were created in 2026 and 79% have no stars. Public repos lean toward hobby, demo and portfolio projects even after filtering.
- **The frame is whatever order GitHub search returns.** Repos outside those 8 size bands, or past the first 1,000 hits in a band, had no chance of being picked.
- **The 30-commit cap** can catch an exposure's start late. I replayed 25 capped repos again with no cap (3,026 commits). No repo changed classification, and start times moved by at most about a day.

## The 43

42 of the 43 repos still exposed at their latest commit got a private note, by email, GitHub's private vulnerability reporting, or an issue asking for a security contact (with no details in it). The last one has no private contact channel and doesn't look deployed, so I left it alone. The published data replaces repo names with `repo-NNN` and table names with salted hashes, because a distinctive table name can be searched back to its repo. As of October 15, one owner has confirmed a fix.

## Checking your own project

In the dashboard, Advisors > Security flags these as "RLS disabled in public". The fix is one line per table, plus policies for whatever access the app actually needs:

```sql
alter table public.messages enable row level security;
```

To catch it before it merges, I built [Lintel](https://github.com/Amsozzer1/lintel), which replays a PR's migrations and fails the check when the PR adds a table `anon` can read:

```sh
npx @amsozzer/lintel migrations check
```

There's also a [playground](/lintel) that runs the same checks in your browser.

The method, the scripts and the anonymized data (one row per sampled commit and per exposure) are in the repo: [study/results.md](https://github.com/Amsozzer1/lintel/blob/main/study/results.md).
