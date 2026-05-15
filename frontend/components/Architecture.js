"use client";

import { useState } from "react";
import styles from "./Architecture.module.css";

const modules = [
  {
    name: "memory.c",
    label: "Custom Heap Allocator",
    funcs: ["my_alloc", "my_dealloc", "coalesce", "align_up"],
    tooltip: "8 KB static VRAM array with first-fit allocation, block splitting, and forward coalescing to reduce fragmentation.",
  },
  {
    name: "math.c",
    label: "Loop-Based Arithmetic",
    funcs: ["my_mul", "my_div", "my_mod", "my_clamp"],
    tooltip: "All arithmetic via repeated addition/subtraction loops. Simulates a minimal instruction set — no *, /, or % operators.",
  },
  {
    name: "string.c",
    label: "String Operations",
    funcs: ["my_strlen", "my_strcpy", "my_strcmp", "my_int_to_str"],
    tooltip: "Pointer-walk strlen, char-by-char copy, lexicographic compare, and digit extraction with reverse for int-to-string.",
  },
  {
    name: "screen.c",
    label: "ANSI Rendering",
    funcs: ["screen_clear", "move_cursor", "draw_char", "draw_border"],
    tooltip: "VT100 escape sequences for cursor positioning, 256-color output, alternate screen buffer, and ioctl terminal sizing.",
  },
  {
    name: "keyboard.c",
    label: "Raw Terminal Input",
    funcs: ["keyboard_init", "key_pressed", "read_key", "map_key"],
    tooltip: "termios raw mode with ICANON/ECHO off, VMIN=0 VTIME=0 non-blocking read. Arrow keys decoded as 3-byte ESC sequences.",
  },
];

export default function Architecture() {
  const [hovered, setHovered] = useState(null);

  return (
    <section className={styles.section} id="architecture">
      <div className={`${styles.header} fade-in`}>
        <p className="section-label">System Design</p>
        <h2 className="section-title">Architecture</h2>
        <p className="section-subtitle" style={{ margin: "0 auto" }}>
          Five independent modules feed into the central game engine. Hover each
          module to explore its internals.
        </p>
      </div>

      <div className={`${styles.diagram} fade-in`}>
        {/* Top — Game Engine */}
        <div className={styles.topModule}>
          <div
            className={styles.moduleEngine}
            onMouseEnter={() => setHovered("engine")}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === "engine" && (
              <div className={styles.tooltip}>
                Game loop, collision detection, food spawning, level progression,
                linked-list snake body, pseudo-RNG, and death animation.
              </div>
            )}
            <div className={styles.moduleName}>snake.c</div>
            <div className={styles.moduleLabel}>Game Engine</div>
            <div className={styles.moduleFuncs}>
              {["game_loop", "collision", "food", "levels", "RNG"].map((f) => (
                <span key={f} className={styles.funcTag}>{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Connector lines */}
        <div className={styles.connectors}>
          {modules.map((_, i) => (
            <div key={i} className={styles.connector} />
          ))}
        </div>

        {/* Bottom — Sub-modules */}
        <div className={styles.bottomModules}>
          {modules.map((mod, i) => (
            <div
              key={i}
              className={styles.module}
              onMouseEnter={() => setHovered(mod.name)}
              onMouseLeave={() => setHovered(null)}
            >
              {hovered === mod.name && (
                <div className={styles.tooltip}>{mod.tooltip}</div>
              )}
              <div className={styles.moduleName}>{mod.name}</div>
              <div className={styles.moduleLabel}>{mod.label}</div>
              <div className={styles.moduleFuncs}>
                {mod.funcs.map((f) => (
                  <span key={f} className={styles.funcTag}>{f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
