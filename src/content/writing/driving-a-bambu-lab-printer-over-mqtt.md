---
title: 'Driving a Bambu Lab printer over MQTT'
description: 'What an A1 mini will actually let you do over its local MQTT broker, which parts are confirmed against hardware, and which are still a guess.'
pubDate: 2026-09-20
tags: ['mqtt', '3d-printing', 'python', 'reverse-engineering']
---

A Bambu Lab printer will print in as many colours as you like, provided a human is standing
next to it. Set the change-filament gcode to a pause, slice a multi-colour model, and the
machine will stop at every change and wait for someone to pull one spool out and push the next
one in. That person is the only thing standing between four spools and any number of them.

[AMS-X](/projects/ams-x) is an attempt to replace that person. This post is about the part I
had to establish first: what the printer will actually let a program do to it, and how much of
that I have confirmed rather than assumed.

## The decision that shapes everything else

The tempting approach is to author your own hotend gcode. Retract this much, heat to that,
purge this many millimetres. It is also a trap, because purge and retraction amounts are a
per-nozzle, per-material calibration problem that never ends, and the printer already solves
it.

So AMS-X writes no hotend gcode at all. It drives the printer's own filament-change routine
and owns only the logistics up to the machine's inlet sensor.

| AMS-X owns                                      | The printer owns                    |
| ----------------------------------------------- | ----------------------------------- |
| which module, and when                          | nozzle temperature                  |
| retracting the spent filament clear of the path | retract from the melt zone          |
| feeding the next filament to the inlet sensor   | load to nozzle, purge, wipe, resume |

The seam is the printer's existing routine. Everything below is about driving its prompts over
the network instead of by hand.

## Getting in

The printer runs an MQTT broker on the local network. TLS on 8883, username `bblp`, password
is the LAN access code from the printer's own screen. The certificate is self-signed, so
verification is off; this is LAN-only and gated by a code you have to be standing at the
machine to read.

```
publish   device/{serial}/request
subscribe device/{serial}/report
```

Files go over FTPS, and FTPS is where the time goes. Three things cost me an evening each:

- It is **implicit** TLS on port 990. The connection is encrypted from the first byte. It is
  not `AUTH TLS` on 21, and a client configured for explicit TLS just hangs.
- The data channel has to **reuse the control connection's TLS session**. A fresh session gets
  refused.
- After `STOR`, do **not** call `unwrap()` on the connection. It will sit waiting for a `226`
  that never comes.

Uploads land in `/cache` on the printer's SD card.

## The plan comes out of the sliced file

A `.gcode.3mf` is a zip. Inside it, `Metadata/plate_1.gcode` is the actual gcode the printer
will run, and it carries the whole change sequence in order:

| Command               | Meaning                                            |
| --------------------- | -------------------------------------------------- |
| `M400 U1`             | pause and wait for a filament change               |
| `M1020 S<n>`          | which project filament is next, zero-indexed       |
| `M620 S<n>A` / `M621` | AMS load and unload, for the AMS path we never use |

So the server unzips the file it is about to send, reads that gcode top to bottom, and comes
away with an ordered plan: change one wants filament two, change two wants filament five, and
so on. No custom slicer, no parsing of the model itself.

The plan is only half of it. The other half is the live pause event arriving over MQTT, which
is what says _now_. The server matches each pause to the next expected change in its own plan,
which means a stray pause from a human pressing the button on the front never gets mistaken
for a swap. The rule is that the server only acts on a pause it can match to something it
planned.

## The loop, confirmed on an A1 mini

Every line here has run against real hardware:

1. the printer pauses on `M400 U1` and the pause shows up in the report stream
2. the server sends `unload_filament`, and the printer heats the nozzle itself
3. a human swaps the spool, because the motorised module is not built yet
4. the server watches `hw_switch_state`, the printer's own filament-present sensor, until it
   trips
5. the server sends `resume`
6. the cursor advances to the next planned change

What is worth noticing is how little of that is mine. Two commands and one sensor. The
printer does the heating, the retract from the melt zone, the load, the purge and the wipe,
because those are the parts it already knows how to do.

## Starting the print

```
1. FTPS upload the .gcode.3mf to /cache/<name>
2. project_file with url = file:///sdcard/cache/<name>
3. param = "Metadata/plate_1.gcode"
4. use_ams = false, ams_mapping = []
5. project / profile / task / subtask ids all "0"
```

Line two is the one that cost me. The obvious URL is `ftp:///cache/<name>`, since that is how
the file got there. Sending that faults the A1 with `0500_C010`, an SD read/write error, which
tells you nothing about what was actually wrong. It wants a filesystem path,
`file:///sdcard/cache/`, not the protocol you uploaded with.

The ids being `"0"` is what makes it a local print. Nothing touches Bambu's cloud.

## The external spool

The printer models the external spool as a tray with reserved identifiers. Writing to it:

```
ams_id 255, tray_id 254, slot 0
colour as 8-hex RRGGBBAA, alpha appended as FF
tray_info_idx GFL04, nozzle 190–240
```

Reading back, `vt_tray.tray_color` gives 8-hex and `vt_tray.tray_type` gives the material.
`layer_num` is reported correctly. `mc_print_line_number`, which would be the obvious way to
know where in the gcode a pause happened, reports `0` on the A1, so the plan cursor is the
only thing tracking position.

## What is still a guess

The A1 path above is confirmed. The X1 and P1 driver is not, and I want to be precise about
that: it is **guesses end to end, thirty-one open markers, zero hardware time**. The unload
trigger, the filament-select command, the resume verb, the start-print shape, all inferred
from the A1 and from what other people have published. One thing I do know is that
`ams_filament_setting` returns an empty payload on that path, so it is not supported there.

Smaller unknowns on the confirmed path:

- `gcode_state` and its `RUNNING` / `PAUSE` / `FINISH` values are read but not proven
- `filam_bak`, the X1/P1 filament sensor, is a guessed field name
- `tray_now` is read without being certain what it means
- using `print_error` to classify _why_ a print paused is inference, not documentation

There is also a `routine_extrude()` that pushes filament with `M83` and `G1 E45 F500`. It is a
diagnostic fallback and deliberately not in the loop, because the loop closes on the sensor
and lets the printer load and purge by itself. Any time I reach for raw gcode, it is a sign
the design has slipped.

## Why write it down like this

The reason for the `[OK]` and `[??]` markers in the repo is that a protocol you inferred is a
protocol you will misremember. Six weeks later, everything you wrote looks equally
authoritative, and you cannot tell which lines you watched work and which ones you reasoned
your way into. Separating them costs a column and saves the argument with yourself.

The A1 is real. The rest is a hypothesis with a test plan attached.

[AMS-X is on GitHub](https://github.com/Amsozzer1/AMS) under MIT, design documents and all.
