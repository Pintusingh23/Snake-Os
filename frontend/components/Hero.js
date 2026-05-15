import styles from "./Hero.module.css";
import Image from "next/image";

export default function Hero() {
  return (
    <section className={styles.hero} id="hero">
      <div className={styles.gridBg} />
      <div className={styles.gradientOverlay} />

      <div className={styles.heroInner}>
        {/* Left — Text */}
        <div className={styles.content}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            ZERO STDLIB · PURE C
          </div>

          <h1 className={styles.headline}>
            Bare-Metal
            <br />
            <span className={styles.headlineAccent}>Terminal Snake</span>
          </h1>

          <p className={styles.subtitle}>
            A fully playable Snake game where every system layer — memory,
            math, strings, rendering — is re-implemented from scratch without
            the C standard library.
          </p>

          <div className={styles.ctas}>
            <a
              href="https://github.com/Pintusingh23/Snake-Os"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaPrimary}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </a>
            <a href="#demo" className={styles.ctaSecondary}>
              Try Demo ↓
            </a>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>0</span>
              <span className={styles.statLabel}>stdlib calls</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>8KB</span>
              <span className={styles.statLabel}>VRAM heap</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>6</span>
              <span className={styles.statLabel}>modules</span>
            </div>
          </div>
        </div>

        {/* Right — Terminal Mockups */}
        <div className={styles.terminalContainer}>
          <div className={styles.terminal}>
            <div className={styles.terminalBar}>
              <span className={`${styles.termDot} ${styles.termDotRed}`} />
              <span className={`${styles.termDot} ${styles.termDotYellow}`} />
              <span className={`${styles.termDot} ${styles.termDotGreen}`} />
              <span className={styles.termTitle}>snake — title screen</span>
            </div>
            <Image
              src="/screenshots/title.png"
              alt="Snake-OS title screen showing ASCII art logo"
              width={750}
              height={550}
              className={styles.terminalImg}
              priority
            />
          </div>

          <div className={styles.terminal}>
            <div className={styles.terminalBar}>
              <span className={`${styles.termDot} ${styles.termDotRed}`} />
              <span className={`${styles.termDot} ${styles.termDotYellow}`} />
              <span className={`${styles.termDot} ${styles.termDotGreen}`} />
              <span className={styles.termTitle}>snake — gameplay lvl 3</span>
            </div>
            <Image
              src="/screenshots/gameplay.png"
              alt="Snake-OS gameplay at level 3 with gradient snake"
              width={750}
              height={550}
              className={styles.terminalImg}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
