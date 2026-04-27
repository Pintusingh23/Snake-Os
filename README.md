# 🐍 Snake-OS

![Snake-OS Logo](/Users/pranaysarkar/.gemini/antigravity/brain/30aa7231-ba72-4089-b10e-3bf468cafd9c/snake_os_title_mockup_1777321422130.png)

### **A Bare-Metal, High-Fidelity Terminal Gaming Experience**
**Snake-OS** is a masterclass in low-level C programming. Built entirely without the C Standard Library (`stdlib.h`), it interacts directly with the operating system and terminal via custom-built memory allocators, math libraries, and ANSI rendering engines.

---

## 👥 Authors
- **Pintu Singh** (230105)
- **Pranay Sarkar** (230047)
- **Fathal** (230043)

---

## 🎮 Game Features

### 🌈 Visual & UX Excellence
- **Vibrant Color Cycling**: The snake evolves through 6 distinct color phases (Green → Cyan → Magenta → Yellow → Red → Blue) as you level up.
- **Gradient Physics**: A custom "fade-to-black" tail effect using ANSI dimming (Bold → Normal → Dim) for a 3D motion feel.
- **Directional Sprites**: The head dynamically changes to `^`, `v`, `<`, or `>` based on your movement.
- **Interactive Feedback**: 
  - **Animated Countdown**: A high-stakes 3-2-1-GO sequence before each round.
  - **Score Popups**: Real-time floating text (`+1`, `+3`, `+5`) appears exactly where you eat food.
  - **Death Animation**: A dramatic red-flash sequence when the snake hits itself.

### 🕹️ Advanced Gameplay
- **Wrap-Around Logic**: Boundaries are no longer your enemy. Teleport seamlessly across the screen.
- **Dynamic Difficulty**: The game speed increases every 5 points, forcing you to adapt.
- **Bonus Food System**:
  - `*` (Regular): 1 Point.
  - `$` (Bonus): 3 Points. Spawns on a timer.
  - `#` (Super): 5 Points. Rare and high-stakes.
- **Blinking Expire System**: Timed food blinks when it's about to vanish!

![Snake-OS Gameplay](/Users/pranaysarkar/.gemini/antigravity/brain/30aa7231-ba72-4089-b10e-3bf468cafd9c/snake_os_gameplay_mockup_1777321441789.png)

---

## 🛠️ Technologies Used

| Module | Implementation | Purpose |
| :--- | :--- | :--- |
| **Memory** | Custom Block Allocator | Replaces `malloc`/`free` with 8KB static VRAM. |
| **Rendering** | ANSI Escape Sequences | Bypasses `ncurses` for direct terminal control. |
| **I/O** | Termios Raw Mode | Non-blocking keyboard input with `ioctl` support. |
| **Math** | Custom Math Lib | Custom `div`, `mod`, and `mul` to avoid ALU operators. |
| **OS Interface** | `unistd.h` Syscalls | Direct communication with the kernel for resizing. |

---

## ⚙️ Setup & Installation Guide

### 1. Prerequisites
Ensure you have a C compiler and `make` installed:
- **macOS**: `brew install gcc make`
- **Ubuntu/Linux**: `sudo apt install build-essential`

### 2. Clone and Compile
```bash
# Clone the repository
git clone https://github.com/Pintusingh23/Snake-Os.git
cd Snake-Os

# Build the project
make clean && make
```

### 3. Launching the Game
```bash
# For best experience, maximize your terminal window first
./snake
```

---

## ⌨️ Controls & Commands

| Key | Action |
| :--- | :--- |
| **`W` / `↑`** | Move Up |
| **`A` / `←`** | Move Left |
| **`S` / `↓`** | Move Down |
| **`D` / `→`** | Move Right |
| **`P`** | **Pause Game** |
| **`R`** | **Restart** (on Game Over) |
| **`Q`** | **Quit Game** |

---

## 📜 Version History

### **v1.3.0** (The Polish Update)
- Added **3-2-1 Countdown** and **Pause Menu**.
- Implemented **Score Popups** and **Death Animation**.
- Integrated **Blinking Timer** for bonus food.
- Added **Dynamic Resize Handling**: Game now pauses and warns if terminal is too small.

### **v1.2.0** (The Visual Update)
- Added **Gradient Tails** and **Directional Head Sprites**.
- Implemented **Color Cycling** (6 colors).
- Added **Multi-tier Food** (`*`, `$`, `#`).

### **v1.1.0** (The Core Update)
- Implemented **Wrap-around** logic.
- Built custom **Math** and **Memory** modules.
- Added **Live HUD** (Score, Level, Best).

### **v1.0.0** (Initial Build)
- Functional terminal Snake with linked-list body.

---

## 📁 Repository Structure
- `src/snake.c`: Core Engine & Game Loop
- `src/memory.c`: Static VRAM Manager
- `src/screen.c`: ANSI Rendering Engine
- `src/keyboard.c`: Raw Mode Input Handler
- `include/`: Header Definitions