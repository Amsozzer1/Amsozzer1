---
title: 'One ESP32, eight spools, two legs per filament move'
description: 'ESP32 firmware driving eight filament spools for a Bambu Lab printer over MQTT: two sensors per move, a shared TMC2209 step bus, and why splitting the move matters.'
pubDate: 2026-09-27
tags: ['esp32', 'firmware', 'cpp', '3d-printing', 'bambu-lab', 'mqtt', 'platformio']
---

A Bambu Lab printer will run one spool at a time from its external feed. AMS-X is the box that
decides which spool that is: eight modules, each with a stepper and a filament sensor, and a
server that tells them when to swap. [The protocol side I wrote up
already](/writing/driving-a-bambu-lab-printer-over-mqtt). This is the firmware, which is where
the interesting failure lives.

Feeding filament sounds like one operation. You turn the motor until the filament arrives. It
took me a while to see that it is two, and that the difference between them is the only reason
the thing can tell you what went wrong.

## Why a filament move needs two sensors

Each module has its own filament sensor a few centimetres past the spool. The printer has its
own, at the inlet. A load runs the filament past the first and into the second:

```cpp
bool Module::crossed() {
    return this->job == Job::LOAD ? this->sensedFilament() : !this->sensedFilamentInPrinter();
}

bool Module::arrived() {
    return this->job == Job::LOAD ? this->sensedFilamentInPrinter() : !this->sensedFilament();
}
```

`crossed()` is the module's own sensor. `arrived()` is the printer's. Unload is the same walk
backwards: leave the printer's sensor first, then run until the module's own sensor lets go.

The two legs get different timeouts, and that is the whole point.

## The first leg is a health check

If filament does not reach the module's own sensor within `ENGAGE_TIMEOUT_MS`, something is
wrong at the spool. It is empty, or the path is jammed, or the filament snapped somewhere you
cannot see. That is a leg you expect to complete in a known, short distance, so a timeout on it
means something specific.

The second leg is the one that actually ends the move, and it is bounded by `LOAD_TIMEOUT_MS`
because the distance from the module to the printer depends on how you routed the tube.

If I had written this as one operation — turn the motor until the printer says it sees filament
— a failure would tell me nothing at all. The motor turned for five seconds and no filament
arrived. Why? Empty spool, jam, bad sensor, tube fell off, wrong module engaged. One timeout,
five causes, and a human walking over to look.

Splitting it means the first timeout says "the problem is at the spool" and the second says "the
filament left the spool and did not arrive", which are different jobs for whoever has to fix it.

<!-- @TODO: the thing that actually made you split it. Was it a jam you had to diagnose by hand?
     A spool that ran out mid-print? This is the paragraph the post needs and I do not have it. -->

## Keeping MQTT alive while a stepper runs

One ESP32 runs all eight modules and the MQTT connection. A load takes seconds. If the move
blocked, the connection would go quiet for the length of it, the broker would time out the
keep-alive, and the server would lose the board mid-swap.

So a move is advanced in bursts:

```cpp
bool Module::tick() {
    if (this->job == Job::NONE) return false;

    for (int i = 0; i < Constants::STEPS_PER_TICK; ++i) {
        if (this->arrived()) { this->stop(); return false; }
        // ... timeout checks ...
        this->pulse();
    }
    return true;
}
```

`tick()` fires a hundred step pulses and returns whether the move is still running. The MQTT
loop calls it once per pass and shortens its own yield while something is moving. The connection
stays up through the whole load because the load never owns the loop for more than a burst.

## Driving eight stepper motors from one ESP32

Step and direction are shared across the cluster. Every module sees every pulse. The only thing
deciding which motor turns is that module's own enable pin, asserted for the length of a move
and released the moment it ends.

That is eight driver enables instead of sixteen step and direction lines, and it makes "exactly
one spool is energised" a property of the wiring rather than something the code has to promise.

The TMC2209's enable is active low, so parked is `HIGH`. I have written `digitalWrite(pin, LOW)`
meaning "off" more times than I want to admit.

## Validating a GPIO pin map that arrives over MQTT

The pin map comes from MQTT. The server sends which GPIO drives which module, and the board
wires itself up from that message.

Which means a wrong message can brick the run. GPIO 6 through 11 are the SPI flash on this
board; reconfigure them and the program you are running stops existing. GPIO 0 is boot
strapping, 1 and 3 are the UART console.

```cpp
static bool pinReserved(int pin) {
    if (pin == 0) return true;              // boot strapping
    if (pin == 1 || pin == 3) return true;  // UART0 console
    if (pin >= 6 && pin <= 11) return true; // SPI flash — reconfiguring these bricks the run
    return false;
}
```

A refused pin raises a fault and shows up in the next status report. The board stays alive to
tell you it would not do the thing.

## What is not finished

`Module::sensedFilament()` returns `false`. The per-module sensor is configured and pulled up,
but nothing reads it yet, so today the first leg is a timer rather than a real health check and
only the printer's sensor ends a move. The design is there and the wire is not.

Wi-Fi credentials and the broker address are compile-time constants, which is fine on a bench
and not fine anywhere else.

<!-- @TODO: anything you want to say about what is next, or what you would do differently. -->

The firmware is [on GitHub](https://github.com/Amsozzer1/AMS-Firmware), MIT licensed. It is
about a thousand lines of C++17 on PlatformIO, and the half that matters is deciding which
sensor you are waiting on.
