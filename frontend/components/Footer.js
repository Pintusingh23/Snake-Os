import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.tagline}>
        Built in pure C — no shortcuts, no libraries, no excuses.
      </p>

      <div className={styles.badges}>
        <span className={styles.badge}>C99</span>
        <span className={styles.badge}>POSIX</span>
        <span className={styles.badge}>MIT License</span>
        <span className={styles.badge}>v2.4.0</span>
      </div>

      <div className={styles.divider} />

      <p className={styles.meta}>
        Newton School of Technology · Sonipat, India · 2026
      </p>

      <p className={styles.copy}>
        © 2026 Pintu Singh, Pranay Sarkar, Shah Fathal
      </p>
    </footer>
  );
}
