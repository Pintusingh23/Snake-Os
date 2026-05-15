import styles from "./Features.module.css";

const features = [
  {
    icon: "⬡",
    title: "Custom Memory Allocator",
    desc: "First-fit allocator on an 8 KB VRAM buffer with block splitting and coalescing to minimize fragmentation.",
    meta: "memory.c · 295 lines",
  },
  {
    icon: "÷",
    title: "Loop-Based Arithmetic",
    desc: "Multiplication, division, and modulo implemented via repeated addition and subtraction — no *, /, or % operators.",
    meta: "math.c · 134 lines",
  },
  {
    icon: "Ø",
    title: "Zero stdlib Dependencies",
    desc: "printf, malloc, rand, strlen — all re-implemented from scratch. Only POSIX syscalls remain.",
    meta: "string.c · 103 lines",
  },
  {
    icon: "▓",
    title: "Raw Terminal Rendering",
    desc: "ANSI/VT100 escape codes for cursor positioning, color, borders, and alternate screen buffer management.",
    meta: "screen.c · 138 lines",
  },
  {
    icon: "⌨",
    title: "Non-Blocking Input",
    desc: "termios raw mode with VMIN=0 VTIME=0 for instant, non-blocking keystroke detection. Arrow keys decoded as 3-byte sequences.",
    meta: "keyboard.c · 155 lines",
  },
  {
    icon: "◈",
    title: "Dynamic Difficulty",
    desc: "Speed increases 5% per level. Three food types with different point values and expiry timers. Gradient snake coloring.",
    meta: "snake.c · 621 lines",
  },
];

const comparisons = [
  { standard: "malloc() / free()", snakeos: "First-Fit allocator on VRAM[8192]" },
  { standard: "*, /, % operators", snakeos: "Repeated addition / subtraction loops" },
  { standard: "printf() / sprintf()", snakeos: "my_int_to_str() + write() syscall" },
  { standard: "ncurses / SDL", snakeos: "Raw ANSI/VT100 escape codes" },
  { standard: "rand()", snakeos: "LCG pseudo-RNG with prime multipliers" },
  { standard: "scanf() blocking I/O", snakeos: "termios raw mode, non-blocking read()" },
];

export default function Features() {
  return (
    <section className={styles.section} id="about">
      <div className={`${styles.header} fade-in`}>
        <p className="section-label">What Makes It Different</p>
        <h2 className="section-title">Every Layer, Rebuilt</h2>
        <p className="section-subtitle" style={{ margin: "0 auto" }}>
          No standard library calls. Every system primitive — from memory
          allocation to integer-to-string conversion — is hand-written.
        </p>
      </div>

      <div className={`${styles.grid} stagger`}>
        {features.map((f, i) => (
          <div key={i} className={`${styles.card} fade-in`}>
            <div className={styles.iconWrap}>{f.icon}</div>
            <h3 className={styles.cardTitle}>{f.title}</h3>
            <p className={styles.cardDesc}>{f.desc}</p>
            <span className={styles.cardMeta}>{f.meta}</span>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className={`${styles.comparison} fade-in`}>
        <div className={styles.compHeader}>
          <div className={styles.compHeaderCell}>Standard Approach</div>
          <div className={styles.compHeaderCell}>Snake-OS Approach</div>
        </div>
        {comparisons.map((c, i) => (
          <div key={i} className={styles.compRow}>
            <div className={styles.compCell}>{c.standard}</div>
            <div className={styles.compCell}>{c.snakeos}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
