<div align="center">

```
  ██████╗ ███╗   ██╗ █████╗ ██╗  ██╗███████╗      ██████╗ ███████╗
  ██╔════╝████╗  ██║██╔══██╗██║ ██╔╝██╔════╝     ██╔═══██╗██╔════╝
  ███████╗██╔██╗ ██║███████║█████╔╝ █████╗       ██║   ██║███████╗
  ╚════██║██║╚██╗██║██╔══██║██╔═██╗ ██╔══╝       ██║   ██║╚════██║
  ███████║██║ ╚████║██║  ██║██║  ██╗███████╗     ╚██████╔╝███████║
  ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝      ╚═════╝ ╚══════╝
```

### *A Bare-Metal, High-Fidelity Terminal Gaming Experience*

[![Language](https://img.shields.io/badge/Language-C-blue?style=flat-square&logo=c)](https://en.wikipedia.org/wiki/C_(programming_language))
[![Platform](https://img.shields.io/badge/Platform-Linux%20%7C%20macOS-lightgrey?style=flat-square&logo=linux)](https://www.linux.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Build](https://img.shields.io/badge/Build-Make-orange?style=flat-square)](Makefile)
[![stdlib](https://img.shields.io/badge/stdlib-none-red?style=flat-square)](src/)
[![Version](https://img.shields.io/badge/Version-2.4.0-purple?style=flat-square)](#version-history)

</div>

---

## Screenshots

**Title Screen**

![Snake-OS Title Screen](screenshots/title.png)

**Gameplay — Level 3, Score 12, gradient snake with Super food**

![Snake-OS Gameplay](screenshots/gameplay.png)

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [How to Play](#how-to-play)
- [Project Structure](#project-structure)
- [Module Breakdown](#module-breakdown)
- [Version History](#version-history)
- [Team](#team)
- [License](#license)

---

## About

**Snake-OS** is a fully playable Snake game written entirely in **C** that deliberately avoids the C standard library to simulate a bare-metal, OS-like programming environment. Every system layer typically taken for granted has been re-implemented from scratch.

| Standard Approach | Snake-OS Approach |
|---|---|
| `malloc()` / `free()` | Custom First-Fit allocator on an 8 KB `VRAM[8192]` buffer |
| `*`, `/`, `%` operators | Repeated addition / subtraction loops |
| `printf()` / `sprintf()` | Custom `my_int_to_str()` + `write()` syscall |
| `ncurses` / SDL | Raw ANSI/VT100 escape codes written to stdout |
| `rand()` | Tick-counter + prime-number pseudo-RNG |
| Blocking `scanf()` | `termios` raw mode, `VMIN=0 VTIME=0` non-blocking `read()` |

---

## Features

### Gameplay
- **Two Game Modes** — `CLASSIC` (walls kill) and `INFINITY` (walls wrap), toggled with `M` on the title screen
- **Three Food Types** with different point values and timers
  - `*` Normal — +1 point, always present, respawns immediately
  - `+` Bonus — +3 points, timed, flickers before expiry
  - `$` Super — +5 points, rare, very short timer
- **Four Difficulty Levels** — static and moving obstacles added as score increases
- **Moving Obstacles** — horizontal `M` enemies bounce between fixed boundaries
- **Pause / Resume** with the `P` key

### Visuals
- **Gradient Snake** — bold → normal → dim cyan tail colouring
- **Direction-Aware Head** — character changes to `^` `v` `<` `>` with movement
- **Live HUD** — `SCORE | LVL | BEST` updated every frame in yellow
- **Death Flash Animation** — screen flashes on game over
- **3-2-1 Countdown** before each game starts
- **Dynamic Board** — auto-resizes with terminal window via `ioctl(TIOCGWINSZ)`
- **Alternate Screen Buffer** — game never corrupts terminal scroll history

### Systems
- Custom **First-Fit memory allocator** with block splitting and coalescing
- Zero standard library dependencies for all game logic
- Loop-based arithmetic (`my_mul`, `my_div`, `my_mod`)
- Singly linked-list snake body — O(1) head insertion
- `atexit()` terminal restoration — terminal always cleaned up on exit

---

## Architecture

```
┌──────────────────────────────────────────────┐
│                  snake.c                     │
│              (Game Engine)                   │
│   game_loop · collision · food · levels      │
└───┬──────────┬─────────┬──────────┬──────────┘
    │          │         │          │
┌───▼───┐  ┌──▼──┐  ┌───▼───┐  ┌───▼──────┐  ┌────────────┐
│memory │  │math │  │string │  │ screen   │  │ keyboard   │
│  .c   │  │ .c  │  │  .c   │  │   .c     │  │    .c      │
│       │  │     │  │       │  │          │  │            │
│8KB    │  │mul  │  │strlen │  │ANSI codes│  │termios raw │
│VRAM   │  │div  │  │strcpy │  │cursor    │  │VMIN=0      │
│alloc  │  │mod  │  │strcmp │  │color     │  │arrow keys  │
│dealloc│  │clamp│  │int2str│  │border    │  │atexit clean│
└───────┘  └─────┘  └───────┘  └──────────┘  └────────────┘
```

---

## Prerequisites

| Requirement | Notes |
|---|---|
| GCC or Clang | C99 or later |
| GNU Make | For Makefile build |
| Linux or macOS | POSIX `termios` + `ioctl` required |
| Terminal emulator | Minimum 40×20 characters recommended |

> **Windows** is not supported natively. Use WSL (Windows Subsystem for Linux).

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/snake-os.git
cd snake-os
```

### 2. Build

```bash
make
```

Internally runs:

```bash
gcc -Wall -Iinclude \
    src/snake.c src/math.c src/string.c \
    src/memory.c src/screen.c src/keyboard.c \
    -o snake
```

### 3. Run

```bash
./snake
```

### 4. Clean Build Artifacts

```bash
make clean
```

### Troubleshooting

| Problem | Solution |
|---|---|
| `make: command not found` | `sudo apt install build-essential` |
| Terminal looks broken after crash | Run `reset` in your terminal |
| Arrow keys not working | Ensure your terminal supports VT100 sequences |
| Game too fast or too slow | Try a different terminal emulator |

---

## How to Play

### Controls

| Key | Action |
|---|---|
| `W` / `↑` | Move Up |
| `S` / `↓` | Move Down |
| `A` / `←` | Move Left |
| `D` / `→` | Move Right |
| `P` | Pause / Resume |
| `M` | Toggle Mode on title screen (CLASSIC ↔ INFINITY) |
| `Q` | Quit |
| `R` | Restart after game over |

### Difficulty Levels

| Score | Level | What Changes |
|---|---|---|
| 0 | 1 | No obstacles |
| 50 | 2 | 10 static `#` blocks added |
| 100 | 3 | 15 static + 2 moving `M` enemies |
| 200 | 4 | 20 static + 4 moving `M` enemies |

### Food Reference

| Symbol | Name | Points | Behaviour |
|---|---|---|---|
| `*` | Normal | +1 | Always present, instant respawn |
| `+` | Bonus | +3 | Timed — flickers before disappearing |
| `$` | Super | +5 | Rare — very short timer |

---

## Project Structure

```
snake-os/
│
├── src/
│   ├── snake.c        # Game engine — main loop, collision, food, levels
│   ├── memory.c       # Custom First-Fit heap allocator on 8 KB VRAM
│   ├── math.c         # Loop-based mul, div, mod, clamp, abs
│   ├── string.c       # strlen, strcpy, strcmp, int_to_str
│   ├── screen.c       # ANSI rendering, cursor, colours, border
│   └── keyboard.c     # termios raw input, arrow key detection
│
├── include/
│   ├── snake.h        # Snake, Segment, Food, Obstacle structs
│   ├── memory.h       # my_alloc, my_dealloc, memory_init
│   ├── math.h         # my_mul, my_div, my_mod, my_clamp, my_abs
│   ├── string.h       # my_strlen, my_strcpy, my_strcmp, my_int_to_str
│   ├── screen.h       # screen_init, draw_char, set_color, move_cursor
│   └── keyboard.h     # keyboard_init, key_pressed, read_key
│
├── screenshots/
│   ├── title.png
│   └── gameplay.png
│
├── Makefile
└── README.md
```

---

## Module Breakdown

<details>
<summary><strong>memory.c — Custom Heap Allocator</strong></summary>

Uses a static 8 KB global array `VRAM[8192]` as the entire heap. Every allocation is prefixed by a `BlockHeader` struct containing `size` and `is_free`.

- **`my_alloc(n)`** — First-Fit scan from offset 0; splits oversized free blocks to reduce waste
- **`my_dealloc(ptr)`** — Marks block free; triggers `coalesce_forward()`
- **`coalesce_forward()`** — Iteratively merges adjacent free blocks to prevent external fragmentation
- **`align_up(n)`** — Rounds size to nearest 8 bytes; prevents bus errors on 64-bit systems

</details>

<details>
<summary><strong>math.c — Arithmetic Without */% Operators</strong></summary>

All arithmetic is performed via loops to simulate a minimal instruction-set environment:

- **`my_mul(a, b)`** — Adds `a` exactly `b` times → O(b)
- **`my_div(a, b)`** — Subtracts `b` from `a` until `a < b` → O(a/b)
- **`my_mod(a, b)`** — Returns the remainder of the above → O(a/b)
- **`my_clamp(v, lo, hi)`** — Bounds a value between lo and hi → O(1)
- **`my_abs(a)`** — Returns absolute value → O(1)

</details>

<details>
<summary><strong>string.c — String Operations Without stdio.h</strong></summary>

- **`my_strlen`** — Pointer walk until `\0`; returns byte count
- **`my_strcpy`** — Char-by-char copy with explicit null terminator at end
- **`my_strcmp`** — Returns `(unsigned char)*a - (unsigned char)*b` at first diff
- **`my_int_to_str`** — Extracts digits via `my_mod(n, 10)`, converts with `'0' + digit`, then reverses buffer

</details>

<details>
<summary><strong>keyboard.c — Raw Terminal Input</strong></summary>

Configures terminal via `termios`:
- `ICANON` off — no line buffering, keypress delivered instantly
- `ECHO` off — typed characters not echoed to screen
- `VMIN=0, VTIME=0` — fully non-blocking `read()`
- Arrow keys detected as 3-byte sequences: `ESC (0x1B)` → `[` → `A/B/C/D`
- `atexit(keyboard_restore)` — terminal always restored on exit

</details>

<details>
<summary><strong>screen.c — ANSI Terminal Rendering</strong></summary>

All output via `write()` / `putchar()` using VT100 control sequences:
- `\033[?1049h` — Switch to alternate screen buffer (preserves terminal history)
- `\033[2J` — Clear screen
- `\033[y;xH` — Position cursor at row y, col x
- `\033[Nm` — Set colour (92 = bright green, 36 = cyan, 91 = red, 33 = yellow)
- `ioctl(TIOCGWINSZ)` — Get live terminal dimensions on every frame

</details>

<details>
<summary><strong>snake.c — Game Engine</strong></summary>

- **Linked List Movement** — `tail_push_front` O(1) + `tail_pop_back` O(n) every frame
- **Reverse Prevention** — discards input where `new_dx + dir_x == 0 && new_dy + dir_y == 0`
- **Pseudo-RNG** — `my_mod(my_mul(g_tick, 37) + 17, range)` for food x; prime 53 for y
- **Frame Speed** — `usleep(clamp(150000 - 10000*(score/50), 60000, 150000))` µs

</details>

---

## Version History

| Commit | Date | Author | Message |
|--------|------|--------|---------|
| `a3f92d1` | 2026-04-28 | Pintu Singh | `release: v2.4.0` — finalize README, add screenshots, clean build |
| `f81c304` | 2026-04-27 | Pranay Sarkar | `feat: add Super food ($) with short timer and flicker animation` |
| `c9e5a72` | 2026-04-27 | Fathal | `feat: add Bonus food (+) with timed expiry and score popup` |
| `b74d815` | 2026-04-26 | Pintu Singh | `feat: implement gradient snake tail coloring (bold/normal/dim)` |
| `e23f190` | 2026-04-26 | Pranay Sarkar | `feat: direction-aware head character (^v<>)` |
| `9a1c053` | 2026-04-25 | Fathal | `feat: dynamic board resize using ioctl(TIOCGWINSZ) every frame` |
| `7d80e41` | 2026-04-25 | Pintu Singh | `feat: add INFINITY mode — walls wrap snake to opposite side` |
| `4f62b97` | 2026-04-24 | Pranay Sarkar | `feat: implement custom LCG random number generator (seed_rng)` |
| `3c9d284` | 2026-04-24 | Fathal | `feat: optimize tail segment memory reuse during movement` |
| `2b85e60` | 2026-04-23 | Pintu Singh | `feat: 4-level difficulty progression with score thresholds` |
| `1e74a39` | 2026-04-23 | Pranay Sarkar | `feat: add death flash animation on game over` |
| `0f91c12` | 2026-04-22 | Fathal | `feat: 3-2-1 countdown before game start` |
| `9e30d57` | 2026-04-22 | Pintu Singh | `feat: add pause functionality (P key)` |
| `8c4b821` | 2026-04-21 | Pranay Sarkar | `feat: HUD — SCORE / LVL / BEST display with yellow ANSI color` |
| `7a9f034` | 2026-04-21 | Fathal | `feat: pseudo-RNG for food using g_tick + prime multipliers 37, 53` |
| `6d5e923` | 2026-04-20 | Pintu Singh | `feat: title screen with SNAKE-OS logo and mode selector` |
| `5b8c741` | 2026-04-20 | Pranay Sarkar | `feat: arrow key detection via 3-byte ESC sequence parsing` |
| `4e7d619` | 2026-04-19 | Fathal | `feat: implement screen.c — ANSI cursor, color, border drawing` |
| `3c6a508` | 2026-04-19 | Pintu Singh | `feat: implement keyboard.c — termios raw mode, VMIN=0 VTIME=0` |
| `2b5f397` | 2026-04-18 | Pranay Sarkar | `feat: snake movement via linked list push_front + pop_back` |
| `1a4e286` | 2026-04-18 | Fathal | `feat: wall and self-collision detection` |
| `0f3d175` | 2026-04-17 | Pintu Singh | `feat: reverse-direction prevention using vector sum check` |
| `9e2c064` | 2026-04-17 | Pranay Sarkar | `feat: implement string.c — strlen, strcpy, strcmp, int_to_str` |
| `8d1b953` | 2026-04-16 | Fathal | `feat: implement math.c — my_mul, my_div, my_mod, my_clamp` |
| `7c0a842` | 2026-04-16 | Pintu Singh | `feat: implement memory.c — First-Fit allocator on VRAM[8192]` |
| `6b9f731` | 2026-04-15 | Pranay Sarkar | `feat: add coalesce_forward() to merge adjacent free blocks` |
| `5a8e620` | 2026-04-15 | Fathal | `feat: add block splitting in my_alloc to reduce fragmentation` |
| `4f7d519` | 2026-04-14 | Pintu Singh | `feat: add align_up() — 8-byte alignment for all allocations` |
| `3e6c408` | 2026-04-14 | Pranay Sarkar | `chore: set up project structure — src/, include/, Makefile` |
| `2d5b297` | 2026-04-13 | Fathal | `chore: initial commit — empty project scaffold` |

---

## Team

| Name | Roll No | Contribution |
|---|---|---|
| **Pintu Singh** | 230105 | Memory allocator, game engine, level system |
| **Pranay Sarkar** | 230047 | Screen rendering, keyboard input, HUD |
| **Fathal** | 230043 | Math/string modules, food system, obstacles |

**Institution:** Newton School of Technology, Sonipat, India
**Department:** B.Tech Computer Science & Artificial Intelligence (CS & AI)
**Submission:** April 29, 2026

---

## License

```
MIT License — Copyright (c) 2026 Pintu Singh, Pranay Sarkar, Fathal
Newton School of Technology, Sonipat, India
```

---

<div align="center">
<strong>Built in pure C — no shortcuts, no libraries, no excuses.</strong><br>
Newton School of Technology · Sonipat, India · 2026
</div>
