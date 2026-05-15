"use client";

import { useState } from "react";
import styles from "./CodeExplorer.module.css";

const modules = [
  {
    name: "memory.c",
    desc: "Custom First-Fit heap allocator operating on an 8 KB static VRAM array. Supports allocation with block splitting and deallocation with forward coalescing.",
    funcs: [
      { name: "memory_init()", desc: "Clear VRAM, reset heap" },
      { name: "my_alloc(size)", desc: "First-fit scan + split" },
      { name: "my_dealloc(ptr)", desc: "Mark free + coalesce" },
      { name: "coalesce_forward()", desc: "Merge adjacent free blocks" },
      { name: "align_up(n)", desc: "Round to pointer alignment" },
    ],
    code: `#define VRAM_SIZE 8192

char VRAM[8192] __attribute__((aligned(sizeof(void *))));

typedef struct BlockHeader {
\tint size;
\tint is_free;
} BlockHeader;

static int g_heap_end = 0;

void *my_alloc(int size)
{
\tint need, hsz, offset;
\tBlockHeader *hdr;

\tif (size <= 0) return 0;

\thsz = header_size();
\tneed = align_up(size);

\t/* First-fit scan for a free block */
\toffset = 0;
\twhile (offset < g_heap_end) {
\t\thdr = (BlockHeader *)(&VRAM[offset]);

\t\tif (hdr->is_free && hdr->size >= need) {
\t\t\tint remaining = hdr->size - need;
\t\t\tif (remaining >= hsz + (int)sizeof(void *)) {
\t\t\t\t/* Split block */
\t\t\t\tBlockHeader *split;
\t\t\t\tsplit = (BlockHeader *)((char *)hdr + hsz + need);
\t\t\t\tsplit->size = remaining - hsz;
\t\t\t\tsplit->is_free = 1;
\t\t\t\thdr->size = need;
\t\t\t}
\t\t\thdr->is_free = 0;
\t\t\treturn (void *)((char *)hdr + hsz);
\t\t}
\t\toffset += hsz + hdr->size;
\t}

\t/* Carve new block at end */
\tif (g_heap_end + hsz + need > VRAM_SIZE) return 0;

\thdr = (BlockHeader *)(&VRAM[g_heap_end]);
\thdr->size = need;
\thdr->is_free = 0;
\tg_heap_end += hsz + need;
\treturn (void *)((char *)hdr + hsz);
}`,
  },
  {
    name: "math.c",
    desc: "All arithmetic implemented via loops to simulate a minimal instruction-set environment. No *, /, or % operators used anywhere.",
    funcs: [
      { name: "my_mul(a, b)", desc: "Repeated addition → O(b)" },
      { name: "my_div(a, b)", desc: "Repeated subtraction → O(a/b)" },
      { name: "my_mod(a, b)", desc: "Remainder via subtraction" },
      { name: "my_clamp(v, lo, hi)", desc: "Bound value → O(1)" },
      { name: "my_abs(a)", desc: "Absolute value → O(1)" },
    ],
    code: `/* Multiplies two integers using repeated addition */
int my_mul(int a, int b)
{
\tint i, result, sign, abs_b;

\tresult = 0;
\tsign = 1;

\tif (a < 0) { a = -a; sign = -sign; }
\tif (b < 0) { b = -b; sign = -sign; }

\tabs_b = b;
\ti = 0;
\twhile (i < abs_b) {
\t\tresult += a;
\t\ti++;
\t}

\treturn (sign < 0) ? -result : result;
}

/* Divides two integers using repeated subtraction */
int my_div(int a, int b)
{
\tint sign, abs_a, abs_b, quotient;

\tif (b == 0) return 0;

\tsign = 1;
\tabs_a = a; abs_b = b;

\tif (abs_a < 0) { abs_a = -abs_a; sign = -sign; }
\tif (abs_b < 0) { abs_b = -abs_b; sign = -sign; }

\tquotient = 0;
\twhile (abs_a >= abs_b) {
\t\tabs_a -= abs_b;
\t\tquotient++;
\t}

\treturn (sign < 0) ? -quotient : quotient;
}

/* Computes remainder using repeated subtraction */
int my_mod(int a, int b)
{
\tint abs_a, abs_b, remainder;

\tif (b == 0) return 0;

\tabs_a = (a < 0) ? -a : a;
\tabs_b = (b < 0) ? -b : b;

\tremainder = abs_a;
\twhile (remainder >= abs_b) {
\t\tremainder -= abs_b;
\t}

\treturn (a < 0) ? -remainder : remainder;
}`,
  },
  {
    name: "string.c",
    desc: "String operations implemented without stdio.h. Pointer-walk length calculation, char-by-char copy, and integer-to-string conversion with digit extraction and reversal.",
    funcs: [
      { name: "my_strlen(s)", desc: "Pointer walk until \\0" },
      { name: "my_strcpy(dst, src)", desc: "Char-by-char copy" },
      { name: "my_strcmp(a, b)", desc: "Lexicographic compare" },
      { name: "my_int_to_str(n, buf)", desc: "Digit extract + reverse" },
      { name: "my_str_reverse(s)", desc: "In-place reversal" },
    ],
    code: `/* Returns the length of a null-terminated string */
int my_strlen(const char *s)
{
\tconst char *p = s;
\twhile (*p != '\\0') p++;
\treturn (int)(p - s);
}

/* Copies src into dst including the null byte */
void my_strcpy(char *dst, const char *src)
{
\twhile (*src != '\\0') {
\t\t*dst = *src;
\t\tdst++;
\t\tsrc++;
\t}
\t*dst = '\\0';
}

/* Converts an integer to a null-terminated string */
void my_int_to_str(int n, char *buf)
{
\tchar *p = buf;
\tunsigned int value;

\tif (n == 0) { *p++ = '0'; *p = '\\0'; return; }

\tif (n < 0) {
\t\t*p++ = '-';
\t\tvalue = (unsigned int)(-(n + 1)) + 1U;
\t} else {
\t\tvalue = (unsigned int)n;
\t}

\twhile (value > 0U) {
\t\t*p++ = (char)('0' + (value % 10U));
\t\tvalue /= 10U;
\t}
\t*p = '\\0';

\tif (*buf == '-') my_str_reverse(buf + 1);
\telse my_str_reverse(buf);
}`,
  },
  {
    name: "screen.c",
    desc: "All terminal output via putchar() and VT100 control sequences. Supports cursor positioning, color codes, border drawing, and dynamic terminal size detection via ioctl.",
    funcs: [
      { name: "screen_clear()", desc: "Clear + reset cursor" },
      { name: "screen_move_cursor(x,y)", desc: "ANSI cursor positioning" },
      { name: "screen_draw_char()", desc: "Single char at position" },
      { name: "screen_draw_border()", desc: "Box drawing with +, -, |" },
      { name: "screen_get_size()", desc: "ioctl TIOCGWINSZ query" },
    ],
    code: `#include <stdio.h>
#include <sys/ioctl.h>
#include <unistd.h>

static void write_text(const char *s)
{
\twhile (*s != '\\0') { putchar(*s); s++; }
}

/* Clears terminal screen and scrollback */
void screen_clear(void)
{
\twrite_text("\\033[2J");   /* Clear screen */
\twrite_text("\\033[3J");   /* Clear scrollback */
\twrite_text("\\033[1;1H"); /* Cursor to top-left */
\tfflush(stdout);
}

/* Moves cursor to column x, row y */
void screen_move_cursor(int x, int y)
{
\tchar xbuf[12], ybuf[12];
\tif (x < 1) x = 1;
\tif (y < 1) y = 1;
\tmy_int_to_str(y, ybuf);
\tmy_int_to_str(x, xbuf);
\twrite_text("\\033[");
\twrite_text(ybuf); putchar(';');
\twrite_text(xbuf); putchar('H');
}

/* Gets terminal dimensions dynamically */
void screen_get_size(int *width, int *height)
{
\tstruct winsize w;
\tif (ioctl(STDOUT_FILENO, TIOCGWINSZ, &w) == 0) {
\t\t*width = w.ws_col;
\t\t*height = w.ws_row;
\t} else {
\t\t*width = 40;  /* Fallback */
\t\t*height = 20;
\t}
}`,
  },
  {
    name: "keyboard.c",
    desc: "Configures terminal via termios for real-time non-blocking input. Arrow keys are detected as 3-byte ESC sequences and mapped to WASD. Terminal is always restored on exit via atexit().",
    funcs: [
      { name: "keyboard_init()", desc: "Set raw mode, register atexit" },
      { name: "keyboard_restore()", desc: "Restore original termios" },
      { name: "key_pressed()", desc: "Non-blocking check + buffer" },
      { name: "read_key()", desc: "Return buffered/fresh key" },
      { name: "map_key()", desc: "ESC[A/B/C/D → WASD" },
    ],
    code: `#include <termios.h>
#include <unistd.h>

static struct termios g_original_termios;

/* Converts arrow key escape sequences to WASD */
static char map_key(char first)
{
\tchar second, third;

\tif (first != 27) return first;  /* Not ESC */

\t/* Read rest of escape sequence: ESC [ A/B/C/D */
\tfor (int tries = 0; tries < 100; tries++) {
\t\tif (read(STDIN_FILENO, &second, 1) == 1) break;
\t\tusleep(100);
\t}
\tif (second != '[') return 0;

\tfor (int tries = 0; tries < 100; tries++) {
\t\tif (read(STDIN_FILENO, &third, 1) == 1) break;
\t\tusleep(100);
\t}

\tif (third == 'A') return 'W';  /* ↑ */
\tif (third == 'B') return 'S';  /* ↓ */
\tif (third == 'C') return 'D';  /* → */
\tif (third == 'D') return 'A';  /* ← */
\treturn 0;
}

/* Initializes terminal raw mode */
void keyboard_init(void)
{
\tstruct termios raw;
\ttcgetattr(STDIN_FILENO, &g_original_termios);
\traw = g_original_termios;
\traw.c_lflag &= ~(ICANON | ECHO);  /* No buffering, no echo */
\traw.c_cc[VMIN]  = 0;   /* Non-blocking */
\traw.c_cc[VTIME] = 0;
\ttcsetattr(STDIN_FILENO, TCSANOW, &raw);
\tatexit(keyboard_restore);
}`,
  },
  {
    name: "snake.c",
    desc: "The central game engine. Linked-list snake body, collision detection, three food types, level progression, dynamic speed, death animation, and two game modes (Classic/Infinity).",
    funcs: [
      { name: "tail_push_front()", desc: "O(1) head insertion" },
      { name: "tail_pop_back()", desc: "Remove last segment" },
      { name: "move_snake()", desc: "Wall wrap or death" },
      { name: "place_food_at()", desc: "RNG placement + retry" },
      { name: "delay_one_tick()", desc: "Speed-scaled usleep" },
    ],
    code: `typedef struct Segment {
\tint x, y;
\tstruct Segment *next;
} Segment;

Segment *snake_head = 0;
int snake_length = 0;

/* O(1) head insertion */
void tail_push_front(int x, int y)
{
\tSegment *node = (Segment *)my_alloc(sizeof(Segment));
\tif (node == 0) return;
\tnode->x = x;
\tnode->y = y;
\tnode->next = snake_head;
\tsnake_head = node;
\tsnake_length += 1;
}

/* Moves snake, returns 0 on wall death (Classic) */
static int move_snake(Snake *snake)
{
\tint nx = snake->x, ny = snake->y;

\tif (snake->direction == 'W') ny--;
\tif (snake->direction == 'A') nx--;
\tif (snake->direction == 'S') ny++;
\tif (snake->direction == 'D') nx++;

\tif (g_classic_mode) {
\t\t/* Classic: wall = death */
\t\tif (nx < PLAY_MIN_X || nx > g_play_max_x ||
\t\t    ny < PLAY_MIN_Y || ny > g_play_max_y)
\t\t\treturn 0;
\t} else {
\t\t/* Infinity: wrap around */
\t\tif (nx < PLAY_MIN_X) nx = g_play_max_x;
\t\tif (nx > g_play_max_x) nx = PLAY_MIN_X;
\t\tif (ny < PLAY_MIN_Y) ny = g_play_max_y;
\t\tif (ny > g_play_max_y) ny = PLAY_MIN_Y;
\t}

\tsnake->x = nx; snake->y = ny;
\treturn 1;
}

/* Pseudo-RNG for food placement */
static unsigned int g_rng_state = 1U;
static unsigned int next_rand(void)
{
\tg_rng_state = g_rng_state * 1103515245U + 12345U;
\treturn g_rng_state;
}`,
  },
];

/* Simple syntax highlighter for C */
function highlightLine(line) {
  const tokens = [];
  let remaining = line;

  while (remaining.length > 0) {
    let match;

    // Comments
    if ((match = remaining.match(/^(\/\/.*|\/\*[\s\S]*?\*\/)/))) {
      tokens.push({ type: "comment", text: match[0] });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Preprocessor
    if ((match = remaining.match(/^(#\w+)/))) {
      tokens.push({ type: "preprocessor", text: match[0] });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Strings
    if ((match = remaining.match(/^("(?:[^"\\]|\\.)*")/))) {
      tokens.push({ type: "string", text: match[0] });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Char literals
    if ((match = remaining.match(/^('(?:[^'\\]|\\.)*')/))) {
      tokens.push({ type: "string", text: match[0] });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Numbers
    if ((match = remaining.match(/^(\b\d+[UuLl]*\b)/))) {
      tokens.push({ type: "number", text: match[0] });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Keywords
    if ((match = remaining.match(/^(\b(?:if|else|while|for|return|break|continue|static|const|typedef|struct|void|int|char|unsigned|extern|sizeof|NULL)\b)/))) {
      tokens.push({ type: "keyword", text: match[0] });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Types
    if ((match = remaining.match(/^(\b(?:Segment|Snake|Food|BlockHeader|ssize_t|size_t|FILE|uint|uintptr_t|termios|winsize)\b)/))) {
      tokens.push({ type: "type", text: match[0] });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Function calls
    if ((match = remaining.match(/^(\b\w+)(\s*\()/))) {
      tokens.push({ type: "function", text: match[1] });
      tokens.push({ type: "plain", text: match[2] });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Operators
    if ((match = remaining.match(/^([+\-*/%=<>!&|^~?:]+)/))) {
      tokens.push({ type: "operator", text: match[0] });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Default: plain character
    tokens.push({ type: "plain", text: remaining[0] });
    remaining = remaining.slice(1);
  }

  return tokens;
}

export default function CodeExplorer() {
  const [activeTab, setActiveTab] = useState(0);
  const mod = modules[activeTab];
  const lines = mod.code.split("\n");

  return (
    <section className={styles.section} id="modules">
      <div className={`${styles.header} fade-in`}>
        <p className="section-label">Source Code</p>
        <h2 className="section-title">Module Explorer</h2>
        <p className="section-subtitle" style={{ margin: "0 auto" }}>
          Browse the actual C source — every function hand-written, every byte accounted for.
        </p>
      </div>

      <div className={`${styles.explorer} fade-in`}>
        {/* Tab bar */}
        <div className={styles.tabs}>
          {modules.map((m, i) => (
            <button
              key={i}
              className={i === activeTab ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(i)}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}>{mod.name}</h3>
            <p className={styles.sidebarDesc}>{mod.desc}</p>
            <span className={styles.funcListTitle}>Key Functions</span>
            <div className={styles.funcList}>
              {mod.funcs.map((f, i) => (
                <div key={i} className={styles.funcItem}>
                  <span className={styles.funcDot} />
                  <span>{f.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code */}
          <div className={styles.codePane}>
            <pre className={styles.codeWrapper}>
              {lines.map((line, i) => (
                <div key={i} className={styles.codeLine}>
                  <span className={styles.lineNum}>{i + 1}</span>
                  <span className={styles.lineContent}>
                    {highlightLine(line).map((token, j) => (
                      <span
                        key={j}
                        className={
                          token.type !== "plain"
                            ? styles[token.type]
                            : undefined
                        }
                      >
                        {token.text}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
