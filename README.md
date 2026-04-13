# Snake-Os
# 🐍 Snake-Os
# 👥 Authors -->
Pintu Singh (230105)
Pranay Sarkar (230047)
Fathal (230043)

A terminal-based Snake game written in **pure C**, built from scratch without using any standard library functions like `malloc`, `free`, `printf`, or string utilities. Everything — memory management, keyboard input, screen rendering, and string handling — is implemented manually.

---

## 📁 Project Structure

```
Snake-Os/
├── Makefile
├── src/
│   ├── snake.c       # Main game logic
│   ├── memory.c      # Custom memory allocator (VRAM-based)
│   ├── keyboard.c    # Terminal raw-mode keyboard input
│   ├── screen.c      # ANSI terminal screen rendering
│   ├── string.c      # Custom string utility functions
│   └── math.c        # Custom math utility functions
└── include/
    ├── memory.h
    ├── keyboard.h
    ├── screen.h
    ├── string.h
    └── math.h
```

---

## ⚙️ How to Build

```bash
make
```

This compiles all source files using `gcc` and produces the `snake` binary.

To clean up the build:

```bash
make clean
```

---

## ▶️ How to Run
make clean && make
 ./snake



Run in a terminal that supports ANSI escape codes (Linux/macOS terminal recommended).

---

## 🎮 Controls

| Key        | Action         |
|------------|----------------|
| `W` / `↑`  | Move Up        |
| `A` / `←`  | Move Left      |
| `S` / `↓`  | Move Down      |
| `D` / `→`  | Move Right     |
| `Q`        | Quit the game  |

Arrow keys are automatically mapped to WASD internally.

---

## 📦 Modules — File-by-File Explanation

---

### `src/snake.c` — Main Game Logic

The heart of the project. This file contains:

- **Board constants** — 40×20 grid with play boundaries (`PLAY_MIN_X`, `PLAY_MAX_X`, `PLAY_MIN_Y`, `PLAY_MAX_Y`).
- **`Segment` struct** — A linked-list node representing one tail segment of the snake. Each node stores `(x, y)` coordinates and a pointer to the next node.
- **`tail_push_front(x, y)`** — Adds a new segment at the front of the tail list (i.e., where the snake head just was). Memory is allocated using `my_alloc()`.
- **`tail_pop_back()`** — Removes the last segment (tail tip) and frees its memory using `my_dealloc()`. Also clears it from the screen.
- **`tail_draw()`** — Walks the segment list and draws each one as `'o'` on screen.
- **`tail_collides(x, y)`** — Checks if any tail segment currently occupies the given position (used for self-collision detection).
- **`Snake` struct** — Stores the head's `(x, y)` position and current direction (`W/A/S/D`).
- **`Food` struct** — Stores the food's `(x, y)` position.
- **`seed_rng()` / `next_rand()`** — A simple linear congruential random number generator seeded using `time()`, used to place food at random positions.
- **`draw_score_row()`** — Redraws the score bar between the top border lines using custom string building (no `sprintf`).
- **`place_food()`** — Randomly tries to place food on an empty cell not occupied by the head or any tail segment. Falls back to a full grid scan if random attempts fail.
- **`update_direction()`** — Updates snake direction based on key pressed (ignores key if it would reverse direction is NOT enforced — any WASD key is accepted).
- **`move_snake()`** — Moves the snake head one step in the current direction. Returns `0` (game over) if the move goes outside the play area.
- **`main()`** — Initializes everything, runs the game loop:
  1. Read keyboard input.
  2. Move the snake head.
  3. Check if food was eaten → grow tail, update score, place new food.
  4. Push old head position to tail, pop tail end if not growing.
  5. Check for self-collision.
  6. Redraw tail and head.
  7. Sleep for one tick (`100ms`).

---

### `src/memory.c` — Custom Memory Allocator

Implements a simple heap allocator entirely within a statically allocated `VRAM[8192]` byte array. No `malloc` or `free` is used anywhere in the project.

- **`VRAM[8192]`** — Global virtual RAM. All dynamic allocations live here.
- **`BlockHeader`** — A small header placed before each allocated block containing: `size` (payload bytes) and `is_free` flag.
- **`g_heap_end`** — Tracks how far into VRAM the heap has grown.
- **`align_up(n)`** — Rounds size up to pointer-aligned boundary for safe memory access.
- **`memory_init()`** — Resets heap state and zeroes out all of VRAM.
- **`my_alloc(size)`** — First-fit allocator: scans for a free block large enough, optionally splits it if there is leftover space, then carves a new block at the end of the heap if none found.
- **`my_dealloc(ptr)`** — Marks a block as free and coalesces it with adjacent free blocks (both forward and backward) to reduce fragmentation.
- **`memory_dump()`** — Debug helper that prints the count of used vs. free blocks on screen row 22.

---

### `src/keyboard.c` — Terminal Keyboard Input

Sets the terminal into **raw mode** so that key presses are read immediately (without needing Enter) and without echoing characters to the screen.

- **`keyboard_init()`** — Saves original terminal settings, then applies raw mode: disables canonical input, echo, output processing, and sets non-blocking reads (`VMIN=0, VTIME=0`). Registers `keyboard_restore()` via `atexit()`.
- **`keyboard_restore()`** — Restores the original terminal settings. Called on exit to ensure the terminal is not left in raw mode.
- **`map_key(char)`** — Converts ANSI escape sequences for arrow keys (`ESC [ A/B/C/D`) into equivalent `W/A/S/D` characters.
- **`key_pressed()`** — Non-blocking check: tries to read one character; if successful, maps it and buffers it. Returns `1` if a key is ready.
- **`read_key()`** — Returns the buffered key if one exists, otherwise does a raw read.

---

### `src/screen.c` — Terminal Screen Rendering

Uses **ANSI escape codes** to draw on the terminal without any curses library.

- **`screen_clear()`** — Sends `ESC[2J` (clear screen) and `ESC[1;1H` (move cursor to top-left).
- **`screen_move_cursor(x, y)`** — Sends `ESC[y;xH` to position the cursor. Builds the escape sequence using `my_int_to_str()`.
- **`screen_draw_char(x, y, c)`** — Moves cursor to `(x, y)` and outputs a single character.
- **`screen_draw_string(x, y, s)`** — Moves cursor to `(x, y)` and outputs a null-terminated string character by character.
- **`screen_draw_border(width, height)`** — Draws a rectangular `#` border: top row, bottom row, and left/right columns.
- **`screen_present()`** — Calls `fflush(stdout)` to push all buffered output to the terminal (acts as a frame flip).

---

### `src/string.c` — Custom String Utilities

Replaces standard `<string.h>` functions with custom implementations:

- **`my_strlen(s)`** — Walks the string until `'\0'` and returns the count.
- **`my_strcpy(dst, src)`** — Copies characters from `src` to `dst` including the null terminator.
- **`my_strcmp(a, b)`** — Compares two strings character by character; returns difference of first mismatched characters.
- **`my_str_reverse(s)`** — Reverses a string in-place using two pointers walking toward each other.
- **`my_int_to_str(n, buf)`** — Converts an integer to its decimal string representation. Handles negative numbers and zero. Uses `my_str_reverse()` after building digits in reverse.

---

### `src/math.c` — Custom Math Utilities

Implements basic math operations without using standard library math functions:

- **`my_abs(a)`** — Returns absolute value: negates `a` if negative.
- **`my_mul(a, b)`** — Multiplies using repeated addition; handles signs manually.
- **`my_div(a, b)`** — Integer division using repeated subtraction; returns `0` on divide-by-zero.
- **`my_mod(a, b)`** — Remainder using repeated subtraction; preserves sign of dividend.
- **`my_clamp(val, min, max)`** — Clamps `val` to the `[min, max]` range.

> **Note:** `my_mul`, `my_div`, and `my_mod` are defined but not used in the current game logic. The standard `%` operator is used in `snake.c` for random food placement because the inputs there involve `unsigned int` values where the custom implementations would be slower and unnecessary.

---

## 🔧 Design Highlights

- **No stdlib heap**: All dynamic memory goes through `my_alloc()` / `my_dealloc()` backed by the 8 KB `VRAM` array.
- **No curses**: Screen rendering is done entirely with ANSI escape sequences via `putchar()`.
- **Linked-list tail**: The snake body is a singly-linked list of `Segment` nodes, allocated from VRAM. Growing and shrinking happen by pushing/popping list nodes.
- **Score = tail length**: The tail is trimmed each tick to match the current score, so eating food naturally grows the snake by one segment.
- **Collision-safe step**: Tail is updated before collision checking, which correctly allows the snake to step into the cell the tail tip just vacated.

---

## 📋 Requirements

- GCC or any C99-compatible compiler
- Linux or macOS terminal with ANSI escape code support
- `make` build tool

---

## 👤 Author

Snake-Os — A bare-metal Snake game built with custom memory, input, and rendering systems.