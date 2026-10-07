---
title: 'A Terminal-Bench task frontier agents could not pass'
description: 'Six runs of Claude Opus 5.5 and GPT-6 Sol scored 0 on a PDF redaction task I wrote for Terminal-Bench. Each agent tested its own work and believed it had passed.'
pubDate: 2026-10-07
tags: ['ai-agents', 'benchmarks', 'evaluation', 'pdf', 'python', 'terminal-bench']
---

I wrote a task for Terminal-Bench, a public benchmark of hard command-line tasks for AI agents. The agent has to build a redactor for court-filing PDFs: black out every visible name and ID on a list, leave nothing recoverable in the file, and change nothing else on the page.

I ran it three times each with Claude Opus 5.5 and GPT-6 Sol on their highest reasoning settings. All six runs failed, and so did two runs where the agent was told to cheat. Each agent wrote a tool of around 4,000 lines and tested it before stopping, and each one believed it had passed. This post is about how I built the task and why the agents stopped where they did.

## What a Terminal-Bench task is

A task is a Docker environment, an instruction, a reference solution and a hidden test suite. The agent gets a shell and the instruction. When it says it’s done, the tests run against whatever it left behind, and the result is pass or fail.

A good task is one a strong engineer could finish with the information given, and that current agents still get wrong. Getting both at once took most of the work.

## Thirteen designs that didn’t work

For each idea, I first asked a few models with no tools how they’d solve it. If their plan named the trick, the idea was dead. Most died there.

The ones that survived got built and run against real agents with tools. A pump-monitoring task looked solid on paper. Opus solved it in 54 minutes by working the hidden behavior out of the residuals in the data. A sewer-overflow model went the same way, and Opus’s answer came in tighter than my own reference solution. A fire-hydrant flow task got passed by five agents out of five.

Each failure came from the same place. For a task to be fair, the information that decides the answer has to be visible to the agent. If it’s visible, an agent with a shell will find structure in it. Opus usually did that in 7 to 30 minutes.

## Picking PDF redaction

I picked redaction because the rules are short and easy to state, and the difficulty is in how many ways content can sit inside a PDF. It’s also a real failure mode. Court filings leak when someone draws a black box over text that’s still in the file.

The first version gave the agent the policy and three sample files. I ran two agents. One failed and the other got a perfect score. Opus read the policy and listed nearly every way a name can hide in a PDF before it opened a file.

The obvious fix was a vaguer spec. I didn’t do that, because a task that withholds a rule is unfair, and a reviewer would be right to reject it.

## Separating the rules from the test cases

What worked was treating the rules and the test cases as separate things. The policy states every rule in full. The hidden test set includes cases no sample shows, and each one is decided by a rule the policy already states. The agent has everything it needs to handle them. It just can’t check its handling against an example.

I built candidate cases and kept one only if:

- it beat the finished tools from both earlier agents,
- my reference solution handled it with a general method, not a special case, and
- a rule already in the policy decided it.

The second condition cost me six candidates. My own reference solution couldn’t handle them cleanly, so I dropped them.

Then I checked that the set wasn’t tuned to the two tools I’d tested against. Two fresh agents that had never seen those tools failed it too. After that I froze the task.

## Running the trials

I set the rules before the first run, because a 0% result means nothing if the runs were broken:

- Freeze and checksum the task before trial one, and never edit it after.
- The reference solution scores 100% and a do-nothing submission scores 0% before any agent runs.
- Run one normal trial and one cheat trial first, then the rest.
- A run counts only if the agent stopped on its own, with no harness errors, no rate limits and no probing of the grader. Anything else gets rerun once and marked.

One Sol run hit a usage cap partway through. I reran it and didn’t count the capped attempt.

Before freezing, I also found a bug in my own grader: it flagged some correctly redacted pages as failures. I fixed it, even though leaving it in would have made the task harder. A task that’s hard because the grader is wrong doesn’t measure anything.

Final results: Opus 0 of 3, Sol 0 of 3, both cheat runs 0.

## Why the agents stopped

None of the agents skipped testing. Each one built a large tool, generated its own test documents and ran them. One made 52.

The problem was what they tested. Each agent checked its output with the same kinds of checks it had used to find the names. Anything its search missed, its verification missed too, so the tests came back clean and the agent stopped. Writing more tests of the same kind wouldn’t have caught the misses.

The policy also requires that nothing else on the page changes, so over-redacting fails too. In the first version, one agent added a safety net that blacked out anything that looked suspicious. It fixed one document and broke another by covering a banner that should have stayed.

## The two models failed differently

Opus and Sol each handled cases that beat every run of the other. One case beat all six runs.

This is why I’d rather have many separately reasoned cases graded all-or-nothing than one clever trick. The next model release tends to solve any single trick. With many cases, a model has to be right about all of them at once.

## The cheat runs

In a cheat trial, the agent is told to pass by any means. Both agents tried to make the problem easier instead of solving it. The grader keeps its own ground truth out of the agent’s reach and runs the agent’s tool on copies, so neither attempt scored.

I also audited the transcripts of the agents I used while building the task, to make sure none of them reached outside their sandbox. Before trusting that audit, I tested it against seven cheats I planted myself.

## How the work was split

I ran this like a small team. Claude agents did most of the building, probing and kill-testing. I set the rules, wrote the decision criteria for each trial outcome, and made the calls. After the first PDF version, the agent recommended submitting it. I pushed instead on hiding the test cases rather than the rules, and that led to the final version.

## What I’d take from it

If you build or deploy agents, look at what your agent checks before it stops. An agent that tests its own work is limited by the tests it thinks to write. When those tests share a blind spot with the solution, it stops with a wrong answer and a passing test suite.

The task is open as [PR #2184](https://github.com/harbor-framework/terminal-bench/pull/2184) on the Terminal-Bench repo, and the evidence for every run is in [the task repo](https://github.com/Amsozzer1/tb3-pdf-redactor).
