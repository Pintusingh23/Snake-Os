# 🐍 Snake-OS

**Snake-OS** is a high-fidelity, terminal-based Snake game written in **pure low-level C**. Built as a "no-standard-library" challenge, it bypasses traditional C functions like `malloc`, `free`, and `printf` in favor of custom-built memory management, terminal rendering, and syscall-based I/O.

---

## 👥 Authors
- **Pintu Singh** (230105)
- **Pranay Sarkar** (230047)
- **Fathal** (230043)

---

## ✨ Features

### 🎮 Gameplay Mechanics
- **Dynamic Wrap-Around**: No more instant death on walls! The snake seamlessly wraps around the terminal boundaries.
- **Progressive Difficulty**: Speed increases by 5% every 5 points, keeping the game challenging yet playable.
- **Multi-Tiered Food**:
  - `*` (Regular): 1 Point.
  - `$` (Bonus): 3 Points. Spawns on a timer.
  - `#` (Super): 5 Points. Rare high-reward food.
- **Timed Challenges**: Bonus food blinks when it's about to expire, creating high-pressure moments.

### 🎨 Visual Excellence
- **Gradient Tail**: The snake's tail uses ANSI dimming effects (Bold → Normal → Dim) to provide a sense of depth and motion.
- **Color Cycling**: The snake changes color every level (Green → Cyan → Magenta → Yellow → Red → Blue).
- **Directional Head**: The head character (`^`, `v`, `<`, `>`) dynamically rotates based on your last input.
- **Interactive UI**: Animated 3-2-1 countdown, score popups (+1, +3, +5), and a flashing death animation.

### 🛠️ Technical Prowess
- **Dynamic Resizing**: Real-time terminal resize detection using `ioctl`. If the terminal becomes too small, the game pauses and prompts you to resize it back.
- **Zero-Dependency Core**:
  - **Memory**: Custom block-allocator using a static 8KB VRAM buffer.
  - **Math**: Custom implementations for `mod`, `div`, and `mul` (strictly avoiding `%` and `/` operators where possible).
  - **Rendering**: Direct ANSI escape sequence injection for zero-latency UI updates.
  - **I/O**: Raw terminal mode configuration for non-blocking keyboard input.

---

## 🚀 Getting Started

### Prerequisites
- GCC Compiler
- `make` build tool
- A terminal with ANSI support (Linux, macOS, or WSL)

### Build & Run
```bash
make clean && make
./snake
```

### Controls
| Key | Action |
|-----|--------|
| `W` / `↑` | Move Up |
| `A` / `←` | Move Left |
| `S` / `↓` | Move Down |
| `D` / `→` | Move Right |
| `P` | Pause / Resume |
| `Q` | Quit Game |

---

## 📜 Version History

### [v1.3.0] - The Final Polish (Current)
- Added **3-2-1 Countdown** before game start.
- Implemented **Pause/Resume** functionality (P key).
- Added **Score Popups** showing (+1, +3, +5) at the location of eaten food.
- Added **Death Animation** (snake flashes red on self-collision).
- Added **Blinking effect** for bonus food when expiring.
- Improved **Resize Resilience**: Game now pauses with a "Too small" message instead of quitting.

### [v1.2.0] - Gameplay Evolution
- Implemented **Wrap-Around Logic**: Snake now traverses off-screen boundaries.
- Refined **Speed Scaling**: Balanced difficulty curve (5% per level).
- Optimized **Random Generation**: Fixed lag spikes during bonus food spawning by implementing efficient bit-masking.
- Added **Gradient Tail** and **Directional Head** sprites.

### [v1.1.0] - Technical Foundation
- Implemented **Dynamic Resizing** using `ioctl` syscalls.
- Added **Color Cycling** based on score levels.
- Created custom **Memory Allocator** and **Math Library**.
- Established the **Raw Terminal Mode** for non-blocking input.

### [v1.0.0] - Initial Release
- Core Snake logic (linked-list segments).
- Basic food spawning and score tracking.
- ANSI border rendering.

---

## 📁 Project Structure
```
Snake-Os/
├── Makefile
├── src/
│   ├── snake.c       # Core Engine & Game Loop
│   ├── memory.c      # VRAM Allocator
│   ├── keyboard.c    # Raw Input Handler
│   ├── screen.c      # ANSI Renderer
│   ├── string.c      # Custom String Utilities
│   └── math.c        # Low-level Math Functions
└── include/          # Header definitions
```

---

## 👤 Author Note
This project was developed to demonstrate low-level system programming skills, bypassing the comfort of the C Standard Library to interact directly with the OS and terminal.